"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Unlock,
  Key,
  ArrowLeftRight,
  CheckCircle2,
  ArrowRight,
  LayoutGrid,
  SlidersHorizontal,
  Rocket,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function DomainTransferPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      step: "1",
      icon: Unlock,
      title: "Unlock your domain",
      desc: "Unlock the domain at your current registrar so it can be transferred out.",
    },
    {
      step: "2",
      icon: Key,
      title: "Get your transfer code",
      desc: "Request the authorization (EPP) code from your current registrar's control panel.",
    },
    {
      step: "3",
      icon: ArrowLeftRight,
      title: "Start your transfer",
      desc: "Enter your domain and authorization code in the Nupat dashboard.",
    },
    {
      step: "4",
      icon: CheckCircle2,
      title: "You are done",
      desc: "When the transfer completes, manage your domain and hosting from one place.",
    },
  ];

  const features = [
    {
      icon: LayoutGrid,
      title: "One dashboard",
      desc: "Manage your domains alongside your other Nupat Cloud services.",
    },
    {
      icon: SlidersHorizontal,
      title: "Simple management",
      desc: "Keep DNS records, renewal dates and transfer locks in one place.",
    },
    {
      icon: Rocket,
      title: "Ready for your website",
      desc: "Point your transferred domain at Nupat hosting or a VPS as soon as it arrives.",
    },
  ];

  const checklist = [
    "Your domain is unlocked at your current registrar",
    "You have your authorization (EPP) code ready",
    "Your domain is eligible for transfer (usually registered at least 60 days ago)",
    "Your administrative contact details are correct and up to date",
  ];

  const faqs = [
    {
      q: "How long does a domain transfer take?",
      a: "Most transfers take 5 to 7 days. The time depends on how quickly your current registrar releases the domain and confirms the request.",
    },
    {
      q: "What is an EPP or authorization code?",
      a: "An EPP code (also called an authorization code, transfer key or Auth-Info code) is a unique key from your current registrar that proves you own the domain you are transferring.",
    },
    {
      q: "Will my website go offline during the transfer?",
      a: "No. As long as your nameservers stay the same during the transfer, your website and anything else on the domain keep working.",
    },
    {
      q: "Can I transfer any domain to Nupat?",
      a: "We support most global extensions (.com, .net, .org, .co, .io) and African country-code domains such as .ng and .africa. Your domain must be at least 60 days old and unlocked.",
    },
    {
      q: "Can I transfer my domain away from Nupat later?",
      a: "Yes. You are never locked in. You can unlock your domain and get your EPP code from your Nupat Cloud dashboard at any time.",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-6 text-left z-10">
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-[#031033] max-w-xl">
                Move your domain with confidence
              </h1>
              <p className="mt-4 text-lg text-[#5A6A85] leading-relaxed max-w-lg">
                Transfer your existing domain to Nupat and manage it next to your hosting and
                servers, with a clear step-by-step process.
              </p>
              <div className="mt-8">
                <Link
                  href="/dashboard/domain-transfer"
                  id="hero-transfer-btn"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-[#1787D4] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
                >
                  Transfer your domain
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center lg:justify-end items-center relative">
              <div className="relative w-full max-w-[380px] sm:max-w-[440px] lg:max-w-[500px]">
                <Image
                  src="/domain-transfer.png"
                  alt="Man relaxing after moving his domain to Nupat Cloud"
                  width={1000}
                  height={999}
                  priority
                  sizes="(min-width: 1024px) 500px, (min-width: 640px) 440px, 380px"
                  className="w-full h-auto object-contain select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-[#F2F5FC] py-16 sm:py-24 border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">
              Transfer your domain in four steps
            </h2>
          </div>

          <ol className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-5">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.step}>
                  <li className="bg-white rounded-xl p-6 border border-[#E2E8F0] relative flex-1 min-h-[190px] flex flex-col justify-between">
                    <Icon className="w-6 h-6 text-[#1787D4] mb-5 shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="text-lg font-semibold text-[#031033] mb-1.5">
                        <span className="text-[#1787D4]">{item.step}.</span> {item.title}
                      </h3>
                      <p className="text-sm text-[#5A6A85] leading-relaxed">{item.desc}</p>
                    </div>
                  </li>

                  {idx < steps.length - 1 && (
                    <li
                      className="hidden lg:flex items-center justify-center text-[#1787D4] px-1 shrink-0"
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </div>
      </section>

      {/* One roof */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-8 sm:mb-10">
                Bring everything under one roof
              </h2>

              <div className="flex flex-col gap-4 sm:gap-5">
                {features.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.title}
                      className="bg-white rounded-xl p-6 border border-[#E2E8F0] flex items-start gap-4"
                    >
                      <Icon className="w-6 h-6 text-[#1787D4] shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <h3 className="text-lg font-semibold text-[#031033] mb-1.5">{feat.title}</h3>
                        <p className="text-sm text-[#5A6A85] leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full max-w-[480px]">
                <Image
                  src="/domain-transfer-1.png"
                  alt="Two monitors passing a document between them"
                  width={800}
                  height={480}
                  sizes="(min-width: 640px) 480px, 100vw"
                  className="w-full h-auto object-contain select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before you transfer */}
      <section className="bg-[#F2F5FC] relative py-16 sm:py-24 border-y border-[#E2E8F0] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 flex flex-col justify-center relative z-10">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-8 sm:mb-10">
                Before you transfer
              </h2>

              <ul className="bg-white rounded-xl p-6 sm:p-8 border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
                {checklist.map((item, idx) => (
                  <li
                    key={item}
                    className={`flex items-center gap-3.5 ${
                      idx === 0 ? "pb-4" : idx === checklist.length - 1 ? "pt-4" : "py-4"
                    }`}
                  >
                    <Check className="w-5 h-5 text-[#12A150] shrink-0" aria-hidden="true" />
                    <span className="text-sm sm:text-base font-medium text-[#031033] leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 flex justify-center items-center lg:absolute lg:right-0 lg:bottom-0">
              <div className="relative w-full max-w-[420px]">
                <Image
                  src="/domain-transfer-2.png"
                  alt="Hands holding a phone with a completed checklist"
                  width={600}
                  height={630}
                  sizes="420px"
                  className="w-full h-auto object-contain select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] text-center mb-10 sm:mb-12">
            Frequently asked questions
          </h2>

          <div className="max-w-3xl mx-auto border border-[#E2E8F0] rounded-xl bg-white divide-y divide-[#E2E8F0] overflow-hidden">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`transfer-faq-${idx}`}
                    className="w-full text-left py-5 px-6 flex items-center justify-between gap-4 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1787D4]"
                  >
                    <span className="font-semibold text-base text-[#031033] group-hover:text-[#1787D4] transition-colors">
                      {faq.q}
                    </span>
                    <span className="shrink-0 text-[#1787D4]">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-5 h-5" aria-hidden="true" />
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <div id={`transfer-faq-${idx}`} className="px-6 pb-6 pt-0">
                      <p className="text-[#5A6A85] text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
