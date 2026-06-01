// src/lib/fingerprint.ts

export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "";

  try {
    const components: string[] = [];

    // 1. Hardware & System Entropy
    components.push(navigator.userAgent || "unknown");
    components.push(navigator.language || "unknown");
    components.push(String(window.screen.colorDepth || 24));
    components.push(`${window.screen.width || 0}x${window.screen.height || 0}`);
    components.push(String(navigator.hardwareConcurrency || 4));
    
    // Estimate RAM (non-standard but highly useful in Chromium browsers)
    if ("deviceMemory" in navigator) {
      const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
      components.push(String(navigatorWithMemory.deviceMemory || 0));
    }

    // Timezone
    try {
      components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown");
    } catch {
      components.push("unknown-tz");
    }

    // 2. Canvas Fingerprinting (Hardware rasterization signature)
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 200;
        canvas.height = 50;
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial', sans-serif";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("TapCash,1234!@#$ 🇨🇦", 2, 2);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Premium-Ecosystem-Audit", 4, 17);
        
        // Shadow/glow effects force unique browser hardware-acceleration signatures
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.fillText("Canvas-Shadow-Fp", 10, 32);

        components.push(canvas.toDataURL());
      }
    } catch {
      components.push("canvas-blocked");
    }

    // 3. Audio Fingerprinting (AudioContext synth signature)
    try {
      const windowWithWebkitAudioContext = window as Window & { webkitAudioContext?: typeof AudioContext };
      const AudioContextClass = window.AudioContext || windowWithWebkitAudioContext.webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        audioCtx.createOscillator();
        const analyser = audioCtx.createAnalyser();
        components.push(String(audioCtx.sampleRate || 44100));
        components.push(String(analyser.fftSize || 2048));
        audioCtx.close();
      }
    } catch {
      components.push("audio-blocked");
    }

    // Assemble and hash using Web Crypto API
    const rawData = components.join("|||");
    const msgBuffer = new TextEncoder().encode(rawData);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
  } catch (err) {
    console.error("Fingerprint engine failure, fallback to userAgent hash:", err);
    // Simple non-crypto hash fallback if Web Crypto is blocked or fails
    const fallbackStr = typeof window !== "undefined" ? window.navigator.userAgent + window.screen.width : "fallback-fp";
    let hash = 0;
    for (let i = 0; i < fallbackStr.length; i++) {
      hash = (hash << 5) - hash + fallbackStr.charCodeAt(i);
      hash |= 0;
    }
    return "fallback_" + Math.abs(hash).toString(16);
  }
}
