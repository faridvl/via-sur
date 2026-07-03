import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://via-sur.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "VíaSur",
  description: "Directorio de servicios locales del sur de Costa Rica.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "VíaSur",
    description: "Directorio de servicios locales del sur de Costa Rica.",
    url: SITE_URL,
    siteName: "VíaSur",
    locale: "es_CR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VíaSur",
    description: "Directorio de servicios locales del sur de Costa Rica.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="h-dvh overflow-hidden bg-gray-950 antialiased sm:bg-[radial-gradient(circle_at_top,_theme(colors.gray.900),_theme(colors.gray.950))]">
        <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-gray-950 sm:my-6 sm:h-[calc(100dvh-3rem)] sm:max-w-lg sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-1 sm:ring-gray-800">
          <div className="flex-1 overflow-y-auto overscroll-contain pb-[68px]">
            {children}
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
