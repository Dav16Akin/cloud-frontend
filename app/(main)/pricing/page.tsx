"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  Minus,
  ShieldCheck,
  Server,
  Zap,
  LifeBuoy,
  Lock,
  ArrowRight,
  ChevronDown,
  CreditCard,
  Activity,
} from "lucide-react";
import PricingPreviewSection from "@/components/home/PricingPreviewSection";

interface FeatureRow {
  name: string;
  starter: string | boolean;
  business: string | boolean;
  agency: string | boolean;
  tooltip?: string;
}

interface FeatureCategory {
  title: string;
  rows: FeatureRow[];
}

const COMPARISON_CATEGORIES: FeatureCategory[] = [
  {
    title: "Core resources",
    rows: [
      {
        name: "Web storage",
        starter: "2 GB SSD",
        business: "10 GB SSD",
        agency: "50 GB NVMe SSD",
      },
      {
        name: "Bandwidth",
        starter: "10 GB",
        business: "50 GB",
        agency: "Unmetered",
      },
      {
        name: "Websites",
        starter: "1",
        business: "5",
        agency: "Unlimited",
      },
      {
        name: "MySQL databases",
        starter: "2",
        business: "10",
        agency: "Unlimited",
      },
      {
        name: "FTP accounts",
        starter: "1",
        business: "5",
        agency: "Unlimited",
      },
    ],
  },
  {
    title: "Security and performance",
    rows: [
      {
        name: "Free SSL certificates",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "Automated daily backups",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "DDoS mitigation and firewall",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "Web server caching",
        starter: "Standard",
        business: "Enhanced",
        agency: "High performance",
      },
      {
        name: "Malware protection",
        starter: true,
        business: true,
        agency: true,
      },
    ],
  },
  {
    title: "Control panel and developer tools",
    rows: [
      {
        name: "cPanel control panel",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "1-click WordPress installer",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "Multiple PHP versions (7.4–8.3)",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "phpMyAdmin access",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "SSH and terminal access",
        starter: false,
        business: true,
        agency: true,
      },
      {
        name: "Git version control",
        starter: false,
        business: true,
        agency: true,
      },
    ],
  },
  {
    title: "Support and guarantees",
    rows: [
      {
        name: "99.9% uptime guarantee",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "Support",
        starter: "Ticket and chat",
        business: "Priority WhatsApp and ticket",
        agency: "Dedicated 24/7 agent",
      },
      {
        name: "Free website migration",
        starter: false,
        business: true,
        agency: true,
      },
      {
        name: "30-day money-back guarantee",
        starter: true,
        business: true,
        agency: true,
      },
    ],
  },
];

const FAQS = [
  {
    q: "How does billing work and what payment methods do you accept?",
    a: "We accept Nigerian debit and credit cards (Mastercard, Visa, Verve) and bank transfers, processed by Paystack. You can pay monthly, quarterly or yearly, and renewals are charged at the rate you signed up for.",
  },
  {
    q: "Do your hosting plans include a free SSL certificate?",
    a: "Yes. Every domain and subdomain hosted on Nupat Cloud gets a Let's Encrypt SSL certificate that renews automatically, at no extra cost.",
  },
  {
    q: "Can I upgrade my plan as my website traffic grows?",
    a: "Yes. You can move from Starter to Business or Agency from your dashboard at any time. Your files and databases carry over and your site stays online during the change.",
  },
  {
    q: "Can I connect an existing domain registered elsewhere?",
    a: "Yes. Point your domain's nameservers to Nupat Cloud, or transfer the registration to us so your hosting and domain are on one bill.",
  },
  {
    q: "What is your refund policy?",
    a: "Every web hosting plan has a 30-day money-back guarantee. If you are not satisfied with the service or support, contact us within 30 days for a full refund.",
  },
];

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-sm font-medium bg-[#1787D4] text-white hover:bg-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";
const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-sm font-medium border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";

function Cell({ value, emphasis }: { value: string | boolean; emphasis?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-4 h-4 text-[#1787D4]" aria-label="Included" />
    ) : (
      <Minus className="w-4 h-4 text-[#C3CCDA]" aria-label="Not included" />
    );
  }
  return (
    <span className={emphasis ? "font-medium text-[#031033]" : undefined}>
      {value}
    </span>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Hero */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 bg-[#F2F5FC] border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-6 text-left">
              <h1 className="text-4xl sm:text-5xl font-semibold text-[#031033] leading-tight mb-5">
                Cloud hosting priced for{" "}
                <span className="text-[#1787D4]">African businesses</span>
              </h1>

              <p className="text-lg text-[#5A6A85] leading-relaxed mb-8 max-w-xl">
                Hosting for your website, web application or agency, billed in
                Naira. Accounts are set up as soon as you pay, with daily
                backups and a 99.9% uptime guarantee.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="#plans"
                  id="pricing-hero-view-plans-btn"
                  className={BTN_PRIMARY}
                >
                  See hosting plans
                </Link>
                <Link
                  href="/domains"
                  id="pricing-hero-domains-btn"
                  className={BTN_SECONDARY}
                >
                  Search domains
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-[460px] sm:max-w-[500px] lg:max-w-[540px]">
                <Image
                  src="/pricing.png"
                  alt="Nupat Cloud transparent hosting pricing for African businesses"
                  width={540}
                  height={540}
                  priority
                  sizes="(min-width: 1024px) 540px, (min-width: 640px) 500px, 90vw"
                  style={{ height: "auto" }}
                  className="w-full h-auto object-contain select-none"
                />

                <div className="absolute top-2 sm:top-6 -left-2 sm:-left-4 lg:-left-6 bg-white rounded-lg py-2.5 px-3.5 border border-[#E2E8F0] flex items-center gap-3 z-10">
                  <CreditCard className="w-5 h-5 text-[#1787D4] shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-[#031033] leading-tight">
                      Pay in Naira (₦)
                    </div>
                    <div className="text-xs text-[#5A6A85]">
                      No FX charges
                    </div>
                  </div>
                </div>

                <div className="absolute top-6 sm:top-10 -right-2 sm:-right-4 bg-white rounded-lg py-2.5 px-3.5 border border-[#E2E8F0] flex items-center gap-3 z-10">
                  <Activity className="w-5 h-5 text-[#1787D4] shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-[#031033] leading-tight">
                      99.9% uptime SLA
                    </div>
                    <div className="text-xs text-[#5A6A85]">
                      On every plan
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 sm:bottom-8 right-0 sm:right-2 lg:-right-2 bg-white rounded-lg py-2.5 px-3.5 border border-[#E2E8F0] flex items-center gap-3 z-10">
                  <ShieldCheck className="w-5 h-5 text-[#12A150] shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-[#031033] leading-tight">
                      30-day guarantee
                    </div>
                    <div className="text-xs text-[#5A6A85]">
                      Full refund if you leave
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <PricingPreviewSection
        id="plans"
        title="Choose the right plan for your business"
        subtitle="Switch between monthly, quarterly and yearly terms to compare rates."
        showFooterLink={false}
        className="py-16 sm:py-24 bg-white relative overflow-hidden scroll-mt-24"
      />

      {/* Feature comparison */}
      <section className="py-16 sm:py-24 bg-[#F2F5FC] border-t border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-3">
              Compare plans side by side
            </h2>
            <p className="text-base text-[#5A6A85]">
              Every plan includes cPanel, free SSL certificates and
              round-the-clock technical support.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[620px] tabular-nums">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th scope="col" className="py-4 px-6 font-medium text-sm text-[#5A6A85] w-1/3">
                      Feature
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold text-sm text-[#031033] w-[22%]">
                      Starter
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold text-sm text-[#031033] w-[22%]">
                      Business
                      <span className="ml-2 text-xs font-medium text-[#1787D4]">
                        Most popular
                      </span>
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold text-sm text-[#031033] w-[22%]">
                      Agency
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {COMPARISON_CATEGORIES.map((category) => (
                    <Fragment key={category.title}>
                      <tr>
                        <th
                          scope="colgroup"
                          colSpan={4}
                          className="pt-8 pb-2 px-6 font-semibold text-sm text-[#031033] border-b border-[#E2E8F0]"
                        >
                          {category.title}
                        </th>
                      </tr>
                      {category.rows.map((row) => (
                        <tr key={row.name} className="border-b border-[#EEF2F7] last:border-b-0">
                          <th scope="row" className="py-3.5 px-6 text-sm font-normal text-[#031033]">
                            {row.name}
                          </th>
                          <td className="py-3.5 px-6 text-sm text-[#5A6A85]">
                            <Cell value={row.starter} />
                          </td>
                          <td className="py-3.5 px-6 text-sm text-[#5A6A85]">
                            <Cell value={row.business} emphasis />
                          </td>
                          <td className="py-3.5 px-6 text-sm text-[#5A6A85]">
                            <Cell value={row.agency} />
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[#5A6A85] text-center sm:text-left">
                Need more resources? Talk to us about high-traffic or dedicated
                hosting.
              </p>
              <Link
                href="#plans"
                className="inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium bg-[#1787D4] text-white hover:bg-[#1370B5] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
              >
                Back to plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Included with every plan */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">
              Included with every plan
            </h2>
            <p className="text-base text-[#5A6A85] mt-3">
              Security, backups and account management come with every hosting
              account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[#E2E8F0]">
              <Lock className="w-6 h-6 text-[#1787D4] mb-4" />
              <h3 className="text-lg font-semibold text-[#031033] mb-1.5">
                Free AutoSSL
              </h3>
              <p className="text-sm text-[#5A6A85] leading-relaxed">
                Let&apos;s Encrypt certificates are issued automatically for
                all your active domains and subdomains.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E2E8F0]">
              <Server className="w-6 h-6 text-[#1787D4] mb-4" />
              <h3 className="text-lg font-semibold text-[#031033] mb-1.5">
                cPanel dashboard
              </h3>
              <p className="text-sm text-[#5A6A85] leading-relaxed">
                The widely used control panel for managing files, domains,
                databases and backups.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E2E8F0]">
              <Zap className="w-6 h-6 text-[#1787D4] mb-4" />
              <h3 className="text-lg font-semibold text-[#031033] mb-1.5">
                SSD storage
              </h3>
              <p className="text-sm text-[#5A6A85] leading-relaxed">
                Solid-state drives for quick database reads and short page load
                times.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E2E8F0]">
              <LifeBuoy className="w-6 h-6 text-[#1787D4] mb-4" />
              <h3 className="text-lg font-semibold text-[#031033] mb-1.5">
                24/7 support
              </h3>
              <p className="text-sm text-[#5A6A85] leading-relaxed">
                Real people answer your technical questions and help you
                troubleshoot, day or night.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-[#F2F5FC] border-t border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">
              Frequently asked questions
            </h2>
            <p className="text-base text-[#5A6A85] mt-3">
              Hosting plans, billing and payments.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  id={`faq-item-${index}`}
                  className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full py-4 px-5 sm:px-6 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1787D4]"
                  >
                    <span className="font-medium text-base text-[#031033]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5A6A85] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-sm text-[#5A6A85] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Custom infrastructure */}
      <section className="py-16 sm:py-24 bg-[#031033]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/nupat_cloud_logo-footer.png"
              alt="Nupat Cloud Logo"
              width={180}
              height={46}
              className="object-contain h-10 w-auto"
            />
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4 max-w-2xl mx-auto">
            Need a custom setup or a high-performance VPS?
          </h2>

          <p className="text-base text-white/70 max-w-xl mx-auto leading-relaxed mb-8">
            Our cloud engineers set up high-availability clusters, dedicated IP
            addresses and environments built around your application.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              id="pricing-contact-sales"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-sm font-medium bg-white text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#031033]"
            >
              Contact our solutions team
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/2349076646154?text=Hi,%20I%20have%20an%20enterprise%20hosting%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              id="pricing-whatsapp-inquiry"
              className="inline-flex items-center justify-center h-11 px-5 rounded-lg text-sm font-medium border border-white/25 text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
