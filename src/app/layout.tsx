import Navigation from "@/components/Navigation";
import { PWAInstaller } from "@/components/PWAInstaller";
import { ReduxProvider } from "@/components/ReduxProvider";
import { AuthProvider } from "@/context/AuthContext";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iAudioBook",
  description: "Distraction-free audiobook listening",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "iAudioBook",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* og image */}
        <meta property="og:image" content="/og_image.png" />
      </head>
      <body suppressHydrationWarning>
        <PWAInstaller />
        <AuthProvider>
          <ReduxProvider>
            <div className="min-h-screen bg-background flex justify-center">
              <div className="mobile-shell w-full">
                {children}
                <Navigation />
              </div>
            </div>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
