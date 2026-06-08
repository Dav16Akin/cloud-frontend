"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Star, ArrowRight, HelpCircle } from "lucide-react";
import { usePlans } from "@/hooks/usePlans";
import type { Plan } from "@/lib/api";

// Metadata is moved to a separate layout or generateMetadata pattern since this is now client.
// SEO is preserved via the parent layout's metadata.

const faqs = [
  { q: "Do you provide free SSL?", a: "Yes. All hosting plans include free SSL certificates at no additional cost." },
  { q: "Can I upgrade my hosting plan later?", a: "Yes. You can upgrade your hosting plan anytime from your dashboard." },
  { q: "Do you provide support?", a: "Yes. Our support team is available to assist with technical and billing issues." },
  { q: "Do hosting plans include email accounts?", a: "Yes. Business email accounts are included with all hosting plans." },
  { q: "Can I transfer my domain?", a: "Yes. You can transfer your existing domain to Nupat Cloud easily." },
];

function formatPrice(price: number) {
  return "₦" + price.toLocaleString("en-NG");
}

function planDescription(name: string) {
  const map: Record<string, string> = {
    Starter: "Ideal for personal websites, portfolios, and small businesses.",
    Business: "Perfect for growing startups and businesses.",
    Agency: "Designed for agencies, developers, and businesses managing multiple projects.",
  };
  return map[name] ?? "A great hosting plan for your needs.";
}

function planCta(name: string) {
  const map: Record<string, string> = {
    Starter: "Choose Starter",
    Business: "Choose Business",
    Agency: "Choose Agency",
  };
  return map[name] ?? `Choose ${name}`;
}

function PlanCardSkeleton() {
  return (
    <div className="relative flex flex-col rounded-2xl p-8 feature-card animate-pulse">
      <div className="h-5 w-32 bg-[#e8edf8] rounded mb-2" />
      <div className="h-4 w-48 bg-[#e8edf8] rounded mb-5" />
      <div className="h-10 w-28 bg-[#e8edf8] rounded mb-7 pb-7" />
      <div className="flex flex-col gap-3 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 w-full bg-[#e8edf8] rounded" />
        ))}
      </div>
      <div className="h-12 w-full bg-[#e8edf8] rounded-xl" />
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const slug = plan.name.toLowerCase();
  const websiteLabel =
    plan.websites >= 999 ? "Unlimited Websites" : `${plan.websites} Website${plan.websites > 1 ? "s" : ""}`;
  const emailLabel =
    plan.emails >= 999 ? "Unlimited Emails" : `${plan.emails} Email Account${plan.emails > 1 ? "s" : ""}`;

  const derivedFeatures = [
    `${plan.storage} Storage`,
    `${plan.bandwidth} Bandwidth`,
    websiteLabel,
    emailLabel,
    ...plan.features,
  ];

  return (
    <div
      id={`pricing-plan-${slug}`}
      className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
        plan.isPopular
          ? "bg-[#031033] shadow-2xl shadow-[#031033]/30 md:scale-[1.04] md:-mt-2"
          : "feature-card"
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 bg-[#e8900a] text-white text-xs font-bold px-4 py-1.5 shadow-sm shadow-[#e8900a]/20">
            <Star className="w-3 h-3 fill-white" />Most Popular
          </span>
        </div>
      )}
      <div className="mb-5">
        <h2 className={`font-bold text-xl mb-1 ${plan.isPopular ? "text-white" : "text-[#031033]"}`}>
          {plan.name} Hosting
        </h2>
        <p className={`text-sm ${plan.isPopular ? "text-gray-200" : "text-[#5a6a85]"}`}>
          {planDescription(plan.name)}
        </p>
      </div>
      <div className={`mb-7 pb-7 border-b ${plan.isPopular ? "border-white/20" : "border-[#dce4f7]"}`}>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-extrabold ${plan.isPopular ? "text-white" : "text-[#031033]"}`}>
            {formatPrice(plan.price)}
          </span>
          <span className={`text-sm ${plan.isPopular ? "text-gray-200" : "text-[#5a6a85]"}`}>
            /{plan.billingCycle === "yearly" ? "year" : plan.billingCycle}
          </span>
        </div>
      </div>
      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {derivedFeatures.map((feat) => (
          <li key={feat} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.isPopular ? "bg-white/20" : "bg-[#f2f5fc] border border-[#dce4f7]"}`}>
              <Check className={`w-3 h-3 ${plan.isPopular ? "text-white" : "text-[#031033]"}`} strokeWidth={2.5} />
            </div>
            <span className={`text-sm ${plan.isPopular ? "text-gray-100" : "text-[#5a6a85]"}`}>{feat}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/register?plan=${slug}`}
        id={`pricing-cta-${slug}`}
        className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
          plan.isPopular ? "bg-white text-[#031033] hover:bg-gray-100 shadow-md" : "btn-primary"
        }`}
      >
        {planCta(plan.name)}<ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function PricingPage() {
  const { data: plans, isLoading, isError } = usePlans();

  return (
    <div className="flex flex-col bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden section-navy-tint">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#031033] mb-5">
            Transparent <span className="gradient-text">Hosting Pricing</span>
          </h1>
          <p className="text-[#5a6a85] text-lg max-w-xl mx-auto">
            Affordable and scalable hosting plans for businesses, startups, developers, and agencies.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="section-pad section-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isError && (
            <p className="text-center text-sm text-red-500 mb-6">
              Could not load plans. Please try refreshing the page.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {isLoading
              ? [...Array(3)].map((_, i) => <PlanCardSkeleton key={i} />)
              : plans?.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad section-light relative">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#031033] mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div key={i} id={`faq-${i}`} className="feature-card p-6 rounded-xl">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-[#e8900a] shrink-0 mt-0.5" strokeWidth={1.8} />
                  <div>
                    <p className="text-[#031033] font-semibold text-sm mb-2">{faq.q}</p>
                    <p className="text-[#5a6a85] text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-pad relative overflow-hidden">
        <div className="absolute inset-0 bg-[#031033]" />
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/nupat-cloud-logo-blackbg-removebg-preview.png"
              alt="Nupat Cloud Logo"
              width={140}
              height={40}
              className="object-contain h-auto w-auto"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Launch Your Website <span style={{ color: "#fd9f09" }}>Today</span>
          </h2>
          <p className="text-gray-300 mb-8">Start with reliable cloud infrastructure designed for African businesses and developers.</p>
          <Link href="/register" id="pricing-final-cta"
            className="inline-flex items-center gap-2 py-4 px-10 rounded-xl text-base font-semibold bg-white text-[#031033] hover:bg-gray-100 transition-all shadow-xl">
            Get Started<ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
