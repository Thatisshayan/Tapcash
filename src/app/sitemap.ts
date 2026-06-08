import { MetadataRoute } from "next";

const baseUrl = "https://tapcash.online";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl + "/", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: baseUrl + "/rapidoreach", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: baseUrl + "/affiliate", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: baseUrl + "/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: baseUrl + "/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: baseUrl + "/cookies", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
