import "./globals.css";
import { Suspense, type ReactNode } from "react";
import Nav from "@/components/Nav";

export const metadata = { title: "Autopilot MVP", description: "Instagram posting, auto DM and AI replies" };
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" as const, themeColor: "#050506" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet" />
      </head>
      <body><Suspense fallback={null}><Nav /></Suspense>{children}</body>
    </html>
  );
}
