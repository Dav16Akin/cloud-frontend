import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Nupat Cloud",
  description:
    "Affordable and scalable hosting plans for businesses, startups, developers, and agencies. Transparent pricing with no hidden fees.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
