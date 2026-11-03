import React from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const OPTION_CLASS =
  "w-full bg-[#031033] hover:bg-[#0A1C4A] text-white text-sm px-4 py-3 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";

export default function StartupProgramSection() {
  const WHATSAPP_NUMBER = "2349076646154";
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello, I would like help choosing and setting up hosting with Nupat Cloud."
  )}`;

  return (
    <section
      id="ai-help"
      className="py-16 sm:py-24 bg-white relative overflow-hidden scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-xl bg-[#031033] overflow-hidden relative">
          {/* Flat brand-blue disc behind the person on the right */}
          <div
            className="absolute right-[-30px] sm:right-[10px] lg:right-[40px] xl:right-[70px] top-1/2 -translate-y-1/2 w-[340px] sm:w-[440px] lg:w-[480px] xl:w-[510px] h-[340px] sm:h-[440px] lg:h-[480px] xl:h-[510px] rounded-full bg-[#1787D4] pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center min-h-[460px] lg:min-h-[500px] relative z-10">
            {/* Left column: heading, description and CTA */}
            <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center relative z-20">
              <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-4 sm:mb-5 text-balance">
                Not sure what to buy? Ask our AI assistant
              </h2>

              <p className="text-white/70 text-base leading-relaxed max-w-md mb-8">
                Start a chat on WhatsApp and get help choosing a domain and
                hosting plan, setting up your servers and getting your
                business online.
              </p>

              <div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="smart-ai-chat-btn"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#031033]"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Right column: chat card and person in armchair */}
            <div className="lg:col-span-7 relative h-full flex flex-col lg:flex-row items-center justify-center lg:justify-end px-6 sm:px-10 lg:px-0 lg:pr-8 xl:pr-12 pt-4 lg:pt-0">
              <div className="w-full max-w-[340px] sm:max-w-[360px] bg-white rounded-xl p-5 sm:p-6 relative z-20 mb-6 lg:mb-0 lg:mr-[-60px] xl:mr-[-70px]">
                <p className="text-xs font-medium text-[#5A6A85] mb-3">
                  Nupat assistant
                </p>

                <div className="bg-[#1787D4] text-white text-base leading-snug p-4 rounded-lg rounded-tl-sm mb-4">
                  Hello. How can I help you today?
                </div>

                <div className="space-y-2.5">
                  <a href="#domain-search" className={OPTION_CLASS}>
                    <span>I want to register a domain</span>
                    <ChevronRight className="w-4 h-4 text-[#1787D4] shrink-0" aria-hidden="true" />
                  </a>
                  <a href="#pricing-preview" className={OPTION_CLASS}>
                    <span>I want to create a website</span>
                    <ChevronRight className="w-4 h-4 text-[#1787D4] shrink-0" aria-hidden="true" />
                  </a>
                  <a href="#pricing-preview" className={OPTION_CLASS}>
                    <span>Help me choose a hosting plan</span>
                    <ChevronRight className="w-4 h-4 text-[#1787D4] shrink-0" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="relative z-10 w-[290px] sm:w-[370px] lg:w-[410px] xl:w-[450px] shrink-0 flex items-end justify-center pointer-events-none select-none lg:self-end">
                <Image
                  src="/deploy.png"
                  alt="Person in an armchair working on a laptop"
                  width={450}
                  height={520}
                  sizes="(max-width: 640px) 290px, (max-width: 1024px) 370px, 450px"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Named alias export
export { StartupProgramSection as SmartAiHelpSection };
