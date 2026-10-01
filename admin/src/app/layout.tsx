import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
} from "next/font/google";

import "./globals.css";
import AdminSidebar from "@/components/ui/AdminSidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Maarga CMS",
  description: "Maarga Website CMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        <AdminSidebar />

        <main
          className="min-h-screen transition-[margin-left] duration-300 ease-in-out"
          style={{
            marginLeft:
              "var(--maarga-sidebar-width)",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}