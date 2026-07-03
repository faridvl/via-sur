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
      <body className="h-dvh overflow-hidden bg-zinc-100 antialiased sm:bg-[radial-gradient(circle_at_top,_theme(colors.zinc.200),_theme(colors.zinc.100))]">
        <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-zinc-50 sm:my-6 sm:h-[calc(100dvh-3rem)] sm:max-w-lg sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-1 sm:ring-zinc-200/80">
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
