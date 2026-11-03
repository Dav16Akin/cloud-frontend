import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CookieConsent } from "@/components/layout/CookieConsent";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Nupat Cloud — Cloud Infrastructure for African Businesses",
  description:
    "Register domains, host websites and run VPS servers on cloud infrastructure built for businesses and developers in Nigeria and across Africa.",
  keywords: [
    "cloud hosting Nigeria",
    "web hosting Africa",
    "domain registration Nigeria",
    "Nupat Cloud",
    "African cloud infrastructure",
  ],
  openGraph: {
    title: "Nupat Cloud — Cloud Infrastructure for African Businesses",
    description:
      "Reliable hosting, domains, and digital infrastructure designed for African businesses and developers.",
    url: "https://nupatcloud.com",
    siteName: "Nupat Cloud",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nupat Cloud — Cloud Infrastructure for African Businesses",
    description:
      "Reliable hosting, domains, and digital infrastructure designed for African businesses and developers.",
  },
  verification: {
    google: "wOAoZUQOlJPg3mOv34ZsfWIlnyPzgm3N4r9zedi7Ow8",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
        <WhatsAppButton />
        <CookieConsent />
      </body>
    </html>
  );
}
