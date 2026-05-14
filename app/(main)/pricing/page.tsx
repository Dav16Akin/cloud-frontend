import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Check, Star, ArrowRight, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — Nupat Cloud",
  description: "Affordable and scalable hosting plans for businesses, startups, developers, and agencies. Transparent pricing with no hidden fees.",
};

const plans = [
  {
    id: "starter", name: "Starter Hosting", price: "₦30,000", period: "/year",
    description: "Ideal for personal websites, portfolios, and small businesses.", popular: false,
    features: ["2GB SSD Storage", "10GB Bandwidth", "1 Website", "Free SSL", "Daily Backup", "2 Email Accounts", "cPanel Access"],
    cta: "Choose Starter", href: "/register?plan=starter",
  },
  {
    id: "business", name: "Business Hosting", price: "₦100,000", period: "/year",
    description: "Perfect for growing startups and businesses.", popular: true,
    features: ["10GB SSD Storage", "50GB Bandwidth", "5 Websites", "10 Email Accounts", "Enhanced Performance", "Daily Backup", "Priority Support"],
    cta: "Choose Business", href: "/register?plan=business",
  },
  {
    id: "agency", name: "Agency Hosting", price: "₦250,000", period: "/year",
    description: "Designed for agencies, developers, and businesses managing multiple projects.", popular: false,
    features: ["50GB SSD Storage", "Unlimited Websites", "Unlimited Emails", "White-label Hosting", "Dedicated Resources", "Advanced Security", "Priority Support"],
    cta: "Choose Agency", href: "/register?plan=agency",
  },
];

const faqs = [
  { q: "Do you provide free SSL?", a: "Yes. All hosting plans include free SSL certificates at no additional cost." },
  { q: "Can I upgrade my hosting plan later?", a: "Yes. You can upgrade your hosting plan anytime from your dashboard." },
  { q: "Do you provide support?", a: "Yes. Our support team is available to assist with technical and billing issues." },
  { q: "Do hosting plans include email accounts?", a: "Yes. Business email accounts are included with all hosting plans." },
  { q: "Can I transfer my domain?", a: "Yes. You can transfer your existing domain to Nupat Cloud easily." },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden section-navy-tint">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#fd9f09] mb-4 bg-[#fffaf0] border border-[#f9d59f] rounded-full px-4 py-1.5">Pricing</span> */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div key={plan.id} id={`pricing-plan-${plan.id}`}
                className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#031033] shadow-2xl shadow-[#031033]/30 md:scale-[1.04] md:-mt-2"
                    : "feature-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-[#fd9f09] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#fd9f09]/30">
                      <Star className="w-3 h-3 fill-white" />Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <h2 className={`font-bold text-xl mb-1 ${plan.popular ? "text-white" : "text-[#031033]"}`}>{plan.name}</h2>
                  <p className={`text-sm ${plan.popular ? "text-gray-200" : "text-[#5a6a85]"}`}>{plan.description}</p>
                </div>
                <div className={`mb-7 pb-7 border-b ${plan.popular ? "border-white/20" : "border-[#dce4f7]"}`}>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.popular ? "text-white" : "text-[#031033]"}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.popular ? "text-gray-200" : "text-[#5a6a85]"}`}>{plan.period}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? "bg-white/20" : "bg-[#f2f5fc] border border-[#dce4f7]"}`}>
                        <Check className={`w-3 h-3 ${plan.popular ? "text-white" : "text-[#031033]"}`} strokeWidth={2.5} />
                      </div>
                      <span className={`text-sm ${plan.popular ? "text-gray-100" : "text-[#5a6a85]"}`}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} id={`pricing-cta-${plan.id}`}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular ? "bg-white text-[#031033] hover:bg-gray-100 shadow-md" : "btn-primary"
                  }`}
                >
                  {plan.cta}<ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
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
                  <HelpCircle className="w-5 h-5 text-[#fd9f09] shrink-0 mt-0.5" strokeWidth={1.8} />
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
