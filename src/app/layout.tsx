import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audiobook Player",
  description: "Distraction-free audiobook listening",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="min-h-screen bg-black flex justify-center">
          <div className="mobile-shell w-full">{children}</div>
        </div>
      </body>
    </html>
  );
}
