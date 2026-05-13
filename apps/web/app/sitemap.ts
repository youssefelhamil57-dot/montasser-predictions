import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.public.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const lastModified = new Date();

  return [
    { url: `${base}/`,                             lastModified, changeFrequency: "hourly", priority: 1.0 },
    { url: `${base}/?date=tomorrow`,               lastModified, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/?date=week`,                   lastModified, changeFrequency: "hourly", priority: 0.7 },
    { url: `${base}/?sport=football`,              lastModified, changeFrequency: "hourly", priority: 0.7 },
    { url: `${base}/?sport=tennis`,                lastModified, changeFrequency: "hourly", priority: 0.5 },
    { url: `${base}/?sport=basketball`,            lastModified, changeFrequency: "hourly", priority: 0.5 },
    { url: `${base}/legal/terms`,                  lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/privacy`,                lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/responsible-gambling`,   lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
