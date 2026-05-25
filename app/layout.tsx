import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./providers";


const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NupatCloud — Cloud Infrastructure for African Businesses",
  description:
    "Launch, host, and grow your business online with reliable hosting, domain registration, business emails, and developer-friendly cloud infrastructure designed for Africa.",
  keywords: [
    "cloud hosting Nigeria",
    "web hosting Africa",
    "domain registration Nigeria",
    "business email Africa",
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", inter.variable, jakarta.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
