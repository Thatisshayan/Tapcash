// src/lib/antiFraud.ts
import { NextRequest } from "next/server";
import { logFraudFlag } from "@/lib/audit";

export interface FraudLog {
  ip: string;
  userId?: string;
  email?: string;
  action: string;
  reason: string;
  userAgent: string;
  details?: Record<string, any>;
  createdAt: any;
}

// Subnets/IP patterns to bypass in development environments
const LOCAL_IPS = ["127.0.0.1", "::1", "localhost"];
const LOCAL_SUBNETS = ["10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."];

/**
 * Extract clean IP address from client headers
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    return ips[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Sniff out headless automation tools / bot browsers
 */
export function isBotAgent(userAgent: string): { isBot: boolean; reason?: string } {
  const lowerAgent = userAgent.toLowerCase();
  
  const botKeywords = [
    "headless", "puppeteer", "playwright", "selenium", "webdriver", "phantomjs", 
    "jsdom", "python-requests", "node-fetch", "axios", "curl", "wget", "postman",
    "scraper", "spider", "crawl", "apache-httpclient", "java/"
  ];

  for (const keyword of botKeywords) {
    if (lowerAgent.includes(keyword)) {
      return { isBot: true, reason: `User-Agent contains headless/automation signature: "${keyword}"` };
    }
  }

  return { isBot: false };
}

/**
 * Query ProxyCheck.io to check if client IP is using a VPN/Proxy/Tor exit node
 */
export async function isIpSuspicious(ip: string, action: string, userId?: string, email?: string, userAgent?: string): Promise<{ suspicious: boolean; reason?: string }> {
  // Check local loopback/development bypass rules
  if (LOCAL_IPS.includes(ip) || LOCAL_SUBNETS.some(subnet => ip.startsWith(subnet))) {
    return { suspicious: false };
  }

  try {
    const key = process.env.PROXYCHECK_API_KEY || "";
    // Default URL works for 1,000 requests/day even without an API key
    const url = `https://proxycheck.io/v2/${ip}?key=${key}&vpn=1`;

    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) {
      console.warn("ProxyCheck API returned non-200, bypassing strictly to prevent disruption");
      return { suspicious: false };
    }

    const data = await res.json();
    if (data.status !== "ok" && data.status !== "warning") {
      console.warn("ProxyCheck status error:", data.message || "Unknown error");
      return { suspicious: false };
    }

    const ipData = data[ip];
    if (ipData && (ipData.proxy === "yes" || ipData.type === "vpn" || ipData.type === "tor")) {
      const reason = `IP flagged as proxy/VPN. Type: ${ipData.type || "unknown"}, Provider: ${ipData.provider || "unknown"}, Country: ${ipData.country || "unknown"}`;
      
      // Atomically log fraud attempt to Firestore
      await logFraudAttempt({
        ip,
        userId,
        email,
        action,
        reason,
        userAgent: userAgent || "unknown",
        createdAt: new Date(),
        details: {
          asn: ipData.asn,
          provider: ipData.provider,
          country: ipData.country,
          isocode: ipData.isocode,
          city: ipData.city,
        }
      });

      return { suspicious: true, reason };
    }

    return { suspicious: false };
  } catch (error: any) {
    console.error("ProxyCheck request error:", error);
    return { suspicious: false }; // Fail-safe to avoid locking out genuine users in case of DNS failures
  }
}

/**
 * Log fraud attempt directly to Firestore for administrative reviews
 */
export async function logFraudAttempt(log: FraudLog): Promise<void> {
  try {
    await logFraudFlag({
      ...log,
      category: "fraud_attempt",
    });
  } catch (err) {
    console.error("Failed to write to fraud_flags collection:", err);
  }
}
