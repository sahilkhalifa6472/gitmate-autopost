import "./globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "git.mate autopost", description: "Instagram auto-posting dashboard for @git.mate", appleWebApp: { capable: true, title: "git.mate", statusBarStyle: "black-translucent" as const } };
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" as const, themeColor: "#050506" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
