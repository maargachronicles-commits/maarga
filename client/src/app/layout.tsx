import type { Metadata } from "next";
import "./globals.css";

import ThemeProvider from "@/providers/ThemeProvider";
import AnimationProvider from "@/providers/AnimationProvider";

export const metadata: Metadata = {
  title: "Maarga — Paths to India's Living Knowledge",
  description:
    "Maarga is the thread between the intellectually curious and those who have given their lives to studying India's heritage. Not a tour. A path to understanding.",
};

/* Clash Grotesk (300/400/500) + Erode (400/600, with italics) — free via Fontshare */
const FONTSHARE =
  "https://api.fontshare.com/v2/css?f[]=clash-grotesk@300,400,500&f[]=erode@400,401,600&display=swap";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTSHARE} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AnimationProvider>{children}</AnimationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
