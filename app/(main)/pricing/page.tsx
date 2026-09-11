"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  Minus,
  ShieldCheck,
  Server,
  Zap,
  LifeBuoy,
  Database,
  Lock,
  ArrowRight,
  ChevronDown,
  Sparkles,
  CreditCard,
  Clock,
  HelpCircle,
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
    title: "Core Resources",
    rows: [
      {
        name: "Web Storage",
        starter: "2 GB SSD",
        business: "10 GB SSD",
        agency: "50 GB NVMe SSD",
      },
      {
        name: "Bandwidth",
        starter: "10 GB",
        business: "50 GB",
        agency: "Unlimited Unmetered",
      },
      {
        name: "Websites Allowed",
        starter: "1 Website",
        business: "5 Websites",
        agency: "Unlimited Websites",
      },
      {
        name: "Business Email Accounts",
        starter: "2 Accounts",
        business: "10 Accounts",
        agency: "Unlimited Accounts",
      },
      {
        name: "MySQL Databases",
        starter: "2 Databases",
        business: "10 Databases",
        agency: "Unlimited Databases",
      },
      {
        name: "FTP Accounts",
        starter: "1 Account",
        business: "5 Accounts",
        agency: "Unlimited Accounts",
      },
    ],
  },
  {
    title: "Security & Performance",
    rows: [
      {
        name: "Free SSL Certificates",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "Automated Daily Backups",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "DDoS Mitigation & Firewall",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "Web Server Caching",
        starter: "Standard",
        business: "Enhanced Caching",
        agency: "Ultra High Performance",
      },
      {
        name: "Free Malware Protection",
        starter: true,
        business: true,
        agency: true,
      },
    ],
  },
  {
    title: "Control Panel & Developer Features",
    rows: [
      {
        name: "cPanel Control Panel",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "1-Click WordPress Installer",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "Multiple PHP Versions (7.4–8.3)",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "phpMyAdmin Access",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "SSH & Terminal Access",
        starter: false,
        business: true,
        agency: true,
      },
      {
        name: "Git Version Control",
        starter: false,
        business: true,
        agency: true,
      },
    ],
  },
  {
    title: "Support & Guarantees",
    rows: [
      {
        name: "99.9% Uptime Guarantee",
        starter: true,
        business: true,
        agency: true,
      },
      {
        name: "Support Level",
        starter: "Standard Ticket & Chat",
        business: "Priority WhatsApp & Ticket",
        agency: "Dedicated 24/7 Agent",
      },
      {
        name: "Free Website Migration",
        starter: false,
        business: true,
        agency: true,
      },
      {
        name: "30-Day Money-Back Guarantee",
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
    a: "We accept all major Nigerian debit and credit cards (Mastercard, Visa, Verve) as well as bank transfers powered securely by Paystack. You can choose to be billed monthly, quarterly, or yearly with no surprise renewal hikes.",
  },
  {
    q: "Do your hosting plans include a free SSL certificate?",
    a: "Yes! Every single domain and subdomain hosted on Nupat Cloud automatically receives an automated, auto-renewing Let's Encrypt SSL certificate at zero extra cost.",
  },
  {
    q: "Can I easily upgrade my plan as my website traffic grows?",
    a: "Absolutely. You can seamlessly upgrade from Starter to Business or Agency from your dashboard at any time. Your data, databases, and emails migrate instantly with zero downtime.",
  },
  {
    q: "Can I connect an existing domain registered elsewhere?",
    a: "Yes, you can either connect your existing domain by updating its nameservers to Nupat Cloud, or easily transfer the domain registration to Nupat to manage both hosting and domain under one single bill.",
  },
  {
    q: "Do all plans include business email accounts?",
    a: "Yes! You can create personalized business email addresses (such as yourname@yourdomain.com) directly inside cPanel with webmail, IMAP, and POP3 support.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer an unconditional 30-day money-back guarantee on all web hosting plans. If you are not completely satisfied with our performance or support, simply reach out within 30 days for a full refund.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* ── 1. Hero Section ── */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#f2f7fc] via-[#f8faff] to-white border-b border-[#e2eaff]">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#1787D4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-[#031033] tracking-tight leading-[1.15] mb-5">
                Cloud hosting built for scale,{" "}
                <br className="hidden sm:inline" />
                <span className="text-[#1787D4]">
                  priced for African businesses.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#5a6a85] leading-relaxed mb-8 max-w-xl">
                Choose the perfect hosting package for your website, web
                application, or growing agency. Instant provisioning, automated
                backups, and 99.9% uptime guaranteed.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8">
                <Link
                  href="#plans"
                  id="pricing-hero-view-plans-btn"
                  className="btn-primary !rounded-full px-7 py-3 text-sm sm:text-[15px] font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  View Pricing Plans &darr;
                </Link>
                <Link
                  href="/domains"
                  id="pricing-hero-domains-btn"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-[15px] font-semibold text-[#031033] bg-white hover:bg-slate-50 border border-[#e2eaff] rounded-full shadow-xs transition-colors"
                >
                  Search Domains &rarr;
                </Link>
              </div>
            </div>

            {/* Right Visual Column with Hero Image and Floating Badges */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-[460px] sm:max-w-[500px] lg:max-w-[540px]">
                {/* Hero Image provided by user */}
                <Image
                  src="/pricing.png"
                  alt="Nupat Cloud transparent hosting pricing for African businesses"
                  width={540}
                  height={540}
                  priority
                  style={{ height: "auto" }}
                  className="w-full h-auto object-contain select-none"
                />

                {/* Badge 1: Pay in Naira (Top Left) */}
                <div className="absolute top-2 sm:top-6 -left-2 sm:-left-4 lg:-left-6 bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3 sm:py-2.5 sm:px-3.5 shadow-lg shadow-black/[0.06] border border-gray-100 flex items-center gap-2.5 sm:gap-3 z-10 animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      Pay in Naira (₦)
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-gray-400">
                      Zero FX charges
                    </div>
                  </div>
                </div>

                {/* Badge 2: 99.9% Uptime SLA (Top Right) */}
                <div className="absolute top-6 sm:top-10 -right-2 sm:-right-4 lg:-right-4 bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3 sm:py-2.5 sm:px-3.5 shadow-lg shadow-black/[0.06] border border-gray-100 flex items-center gap-2.5 sm:gap-3 z-10 animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      99.9% Uptime SLA
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-gray-400">
                      Enterprise reliability
                    </div>
                  </div>
                </div>

                {/* Badge 3: 30-Day Guarantee (Bottom Right) */}
                <div className="absolute bottom-4 sm:bottom-8 right-0 sm:right-2 lg:-right-2 bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3 sm:py-2.5 sm:px-3.5 shadow-lg shadow-black/[0.06] border border-gray-100 flex items-center gap-2.5 sm:gap-3 z-10 animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      30-Day Guarantee
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-gray-400">
                      100% risk-free
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Unified Pricing Section ── */}
      <PricingPreviewSection
        id="plans"
        title="Choose the right plan for your business"
        subtitle="Toggle between monthly, quarterly, or yearly terms to view our rates."
        showFooterLink={false}
        className="py-14 sm:py-20 lg:py-24 bg-white relative overflow-hidden scroll-mt-24"
      />

      {/* ── 3. Comprehensive Feature Comparison Table ── */}
      <section className="py-16 sm:py-24 bg-[#f8faff] border-t border-[#e2eaff]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1787D4] bg-[#1787D4]/10 px-3.5 py-1.5 rounded-full">
              Full Comparison
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#031033] tracking-tight mt-3 mb-3">
              Compare all features side by side
            </h2>
            <p className="text-sm sm:text-base text-[#5a6a85]">
              Every tier comes packed with cPanel, free SSL certificates, and
              round-the-clock technical support.
            </p>
          </div>

          {/* Comparison Table Card */}
          <div className="bg-white rounded-3xl border border-[#e2eaff] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[620px]">
                {/* Header */}
                <thead>
                  <tr className="border-b border-[#e2eaff] bg-[#f2f7fc]/70">
                    <th className="py-5 px-6 font-bold text-sm text-[#031033] w-1/3">
                      Features
                    </th>
                    <th className="py-5 px-6 font-bold text-sm text-[#031033] w-[22%]">
                      Starter
                    </th>
                    <th className="py-5 px-6 font-bold text-sm text-[#1787D4] w-[22%] bg-[#1787D4]/5">
                      Business (Popular)
                    </th>
                    <th className="py-5 px-6 font-bold text-sm text-[#031033] w-[22%]">
                      Agency
                    </th>
                  </tr>
                </thead>

                {/* Body Categories */}
                <tbody className="divide-y divide-[#eef3fb]">
                  {COMPARISON_CATEGORIES.map((category) => (
                    <div key={category.title} className="contents">
                      <tr className="bg-[#f8faff]">
                        <td
                          colSpan={4}
                          className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-[#1787D4] bg-[#eef5fc]"
                        >
                          {category.title}
                        </td>
                      </tr>
                      {category.rows.map((row) => (
                        <tr
                          key={row.name}
                          className="hover:bg-[#fafbff] transition-colors"
                        >
                          <td className="py-3.5 px-6 text-xs sm:text-sm font-medium text-[#031033]">
                            {row.name}
                          </td>
                          <td className="py-3.5 px-6 text-xs sm:text-sm text-[#5a6a85]">
                            {typeof row.starter === "boolean" ? (
                              row.starter ? (
                                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[#1787D4]">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                              ) : (
                                <Minus className="w-4 h-4 text-slate-300" />
                              )
                            ) : (
                              row.starter
                            )}
                          </td>
                          <td className="py-3.5 px-6 text-xs sm:text-sm font-semibold text-[#031033] bg-[#1787D4]/5">
                            {typeof row.business === "boolean" ? (
                              row.business ? (
                                <div className="w-5 h-5 rounded-full bg-[#1787D4] flex items-center justify-center text-white">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                              ) : (
                                <Minus className="w-4 h-4 text-slate-300" />
                              )
                            ) : (
                              row.business
                            )}
                          </td>
                          <td className="py-3.5 px-6 text-xs sm:text-sm text-[#5a6a85]">
                            {typeof row.agency === "boolean" ? (
                              row.agency ? (
                                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[#1787D4]">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                              ) : (
                                <Minus className="w-4 h-4 text-slate-300" />
                              )
                            ) : (
                              row.agency
                            )}
                          </td>
                        </tr>
                      ))}
                    </div>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Bottom Quick CTA */}
            <div className="p-6 bg-[#f8faff] border-t border-[#e2eaff] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#5a6a85] text-center sm:text-left">
                Need more custom resources? Talk to us for high-traffic or
                dedicated hosting solutions.
              </p>
              <Link
                href="#plans"
                className="btn-primary py-2.5 px-6 text-xs font-semibold rounded-xl shrink-0"
              >
                Back to Plans &uarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Included with Every Plan Grid ── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031033] tracking-tight">
              Included with every Nupat Cloud plan
            </h2>
            <p className="text-sm text-[#5a6a85] mt-2">
              Every hosting account includes these essential security,
              reliability, and management tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#f8faff] border border-[#e2eaff] hover:border-[#1787D4]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#1787D4]/10 text-[#1787D4] flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#031033] mb-1.5">
                Free AutoSSL
              </h3>
              <p className="text-xs text-[#5a6a85] leading-relaxed">
                Automatic Let&apos;s Encrypt SSL certificates for all your
                active domains and subdomains.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8faff] border border-[#e2eaff] hover:border-[#1787D4]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#1787D4]/10 text-[#1787D4] flex items-center justify-center mb-4">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#031033] mb-1.5">
                cPanel Dashboard
              </h3>
              <p className="text-xs text-[#5a6a85] leading-relaxed">
                The world standard control panel to manage emails, files,
                domains, and database backups.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8faff] border border-[#e2eaff] hover:border-[#1787D4]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#1787D4]/10 text-[#1787D4] flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#031033] mb-1.5">
                Fast SSD Storage
              </h3>
              <p className="text-xs text-[#5a6a85] leading-relaxed">
                High-throughput solid-state drives engineered for instant
                database reads and quick page load times.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8faff] border border-[#e2eaff] hover:border-[#1787D4]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#1787D4]/10 text-[#1787D4] flex items-center justify-center mb-4">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#031033] mb-1.5">
                24/7 Expert Support
              </h3>
              <p className="text-xs text-[#5a6a85] leading-relaxed">
                Responsive, human technical assistance whenever you have
                questions or need help troubleshooting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ Accordion ── */}
      <section className="py-16 sm:py-20 bg-[#f8faff] border-t border-[#e2eaff]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1787D4] bg-[#1787D4]/10 px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031033] tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#5a6a85] mt-2">
              Everything you need to know about our hosting plans and payment
              process.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  id={`faq-item-${index}`}
                  className="bg-white rounded-2xl border border-[#e2eaff] overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4 px-5 sm:px-6 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-[#fafbff] transition-colors"
                  >
                    <span className="font-bold text-sm sm:text-base text-[#031033]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5a6a85] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#1787D4]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#5a6a85] leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. Enterprise & Custom Infrastructure Banner ── */}
      <section className="py-16 sm:py-20 bg-[#031033] relative overflow-hidden">
        {/* Ambient background light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1787D4]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#fd9f09]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Brand Logo on Dark Background */}
          <div className="flex justify-center mb-6">
            <Image
              src="/nupat_cloud_logo-footer.png"
              alt="Nupat Cloud Logo"
              width={180}
              height={46}
              className="object-contain h-10 w-auto"
            />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 max-w-2xl mx-auto">
            Need custom architecture or high-performance VPS?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            Our cloud engineering team configures high-availability clusters,
            dedicated IP addresses, and tailored environments for enterprise
            applications.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              id="pricing-contact-sales"
              className="btn-primary py-3.5 px-8 text-sm font-semibold rounded-xl shadow-lg"
            >
              Contact Solutions Team
              <ArrowRight className="w-4 h-4 ml-1.5 inline" />
            </Link>
            <a
              href="https://wa.me/2349076646154?text=Hi,%20I%20have%20an%20enterprise%20hosting%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              id="pricing-whatsapp-inquiry"
              className="py-3.5 px-7 text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
