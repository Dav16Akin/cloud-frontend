import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Nupat Cloud",
  description:
    "Web hosting plans for businesses, startups, developers and agencies, billed in Naira. Compare Starter, Business and Agency plans with no hidden fees.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
