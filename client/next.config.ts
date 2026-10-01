import type { NextConfig } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const apiHost = (() => {
  try {
    return new URL(API).hostname;
  } catch {
    return "localhost";
  }
})();
const isLocalApi = /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/.test(apiHost);

const nextConfig: NextConfig = {
  images: {
    // Serve images straight from /public instead of through /_next/image.
    // On the Vercel Services deployment the optimizer URLs came back broken.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // placeholder content + local uploads served by the API / this app during development
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      ...(isLocalApi ? [] : [{ protocol: "http" as const, hostname: apiHost }, { protocol: "https" as const, hostname: apiHost }]),
    ],
    // Next 16 blocks image optimisation from private IPs by default; the dev API
    // (and its /uploads) run on localhost, so allow it while the API is local.
    dangerouslyAllowLocalIP: isLocalApi,
  },
};

export default nextConfig;
