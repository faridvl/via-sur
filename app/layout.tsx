import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ticored.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TicoRed",
  description: "La red de comercios y servicios de Costa Rica.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "TicoRed",
    description: "La red de comercios y servicios de Costa Rica.",
    url: SITE_URL,
    siteName: "TicoRed",
    locale: "es_CR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TicoRed",
    description: "La red de comercios y servicios de Costa Rica.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0c63c2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="h-dvh overflow-hidden bg-gray-950 antialiased sm:bg-[radial-gradient(circle_at_top,_theme(colors.gray.900),_theme(colors.gray.950))]">
        <div className="fondo-app mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden sm:my-6 sm:h-[calc(100dvh-3rem)] sm:max-w-lg sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-1 sm:ring-gray-800">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
