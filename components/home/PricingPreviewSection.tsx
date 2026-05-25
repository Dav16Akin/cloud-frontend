import Link from "next/link";
import { Check, Star, ArrowRight } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "₦30,000",
    period: "/year",
    description: "Small businesses and personal websites",
    popular: false,
    features: ["2GB SSD Storage", "Free SSL Certificate", "1 Website", "2 Business Emails", "Daily Backups", "cPanel Access", "24/7 Monitoring"],
    cta: "Get Started",
    href: "/register",
  },
  {
    id: "business",
    name: "Business",
    price: "₦100,000",
    period: "/year",
    description: "Growing businesses and startups",
    popular: true,
    features: ["10GB SSD Storage", "Free SSL Certificate", "5 Websites", "10 Business Emails", "Priority Support", "Daily Backups", "Enhanced Performance"],
    cta: "Choose Business",
    href: "/register?plan=business",
  },
  {
    id: "agency",
    name: "Agency",
    price: "₦250,000",
    period: "/year",
    description: "Agencies and developers managing multiple clients",
    popular: false,
    features: ["50GB SSD Storage", "Unlimited Websites", "Unlimited Emails", "White-label Support", "Dedicated Resources", "Advanced Security", "Priority Infrastructure"],
    cta: "Start Scaling",
    href: "/register?plan=agency",
  },
];

export default function PricingPreviewSection() {
  return (
    <section id="pricing-preview" className="section-pad section-light relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-[#031033]/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#e8900a] mb-3">Hosting Plans</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031033] mb-4">
            Plans for Every{" "}
            <span className="text-[#e8900a]">Stage of Growth</span>
          </h2>
          <p className="text-[#5a6a85] text-lg max-w-2xl mx-auto">
            Flexible hosting plans for startups, growing businesses, agencies, and developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
              id={`plan-${plan.id}`}
              className={`relative flex flex-col p-7 transition-all duration-300 ${
                plan.popular
                  ? "bg-[#031033] text-white shadow-xl shadow-[#031033]/20 scale-[1.02] md:-mt-2 border border-[#031033]"
                  : "feature-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-[#e8900a] text-white text-xs font-bold px-4 py-1 shadow-lg shadow-[#e8900a]/20">
                    <Star className="w-3 h-3 fill-white" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-bold text-xl mb-1 ${plan.popular ? "text-white" : "text-[#031033]"}`}>{plan.name}</h3>
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

              <Link
                href={plan.href}
                id={`plan-${plan.id}-cta`}
                className={`flex items-center justify-center gap-2 py-3.5 font-semibold text-sm transition-all ${
                  plan.popular
                    ? "bg-[#e8900a] text-white hover:bg-[#c97a08]"
                    : "btn-primary"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/pricing" id="view-all-pricing" className="text-[#e8900a] text-sm font-medium hover:underline underline-offset-4 inline-flex items-center gap-1.5">
            View full pricing details
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
