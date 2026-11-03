"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Mail,
  MapPin,
  Phone,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  ArrowRight,
  Send,
} from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L2.058 2.25H8.08l4.265 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const TOPIC_OPTIONS = [
  "General inquiry",
  "Sales",
  "Technical support",
  "Domains",
  "Web hosting",
  "Cloud infrastructure",
  "Business solutions",
  "Partnerships",
  "Other",
];

const FAQS = [
  {
    q: "How quickly will I get a response?",
    a: "During support hours we usually reply to general inquiries within 1–2 hours. Priority channels are staffed 24/7.",
  },
  {
    q: "Can I contact support about my domain or hosting?",
    a: "Yes. Our support team can help with domain setup, DNS records, cPanel hosting, SSL certificates and our other services.",
  },
  {
    q: "Can I speak with someone about choosing a solution?",
    a: "Yes. Our sales team can help you pick the right hosting plan, cloud infrastructure or enterprise setup for your business.",
  },
  {
    q: "Where can I find technical documentation?",
    a: "Our documentation site (docs.nupatcloud.com) has product guides, tutorials, API references and developer resources.",
  },
];

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-sm font-medium bg-[#1787D4] text-white hover:bg-[#1370B5] transition-colors disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";

const INPUT =
  "w-full h-11 px-4 rounded-lg border border-[#D5DCE6] bg-white text-base sm:text-sm text-[#031033] placeholder:text-[#8A97AD] focus:outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/20 transition-colors";

const LABEL = "block text-sm font-medium text-[#031033] mb-1.5";

const CARD_LINK =
  "text-sm font-medium text-[#1787D4] hover:text-[#1370B5] hover:underline inline-flex items-center gap-1 mt-auto pt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] rounded";

const HELP_CARDS = [
  {
    image: "/contact-1.png",
    title: "Talk to our team",
    body: "Questions about our products, pricing or the right setup for your business.",
    href: "#send-message",
    label: "Talk to sales",
    external: false,
  },
  {
    image: "/conatct-2.png",
    title: "Get technical support",
    body: "Help with your account, website, domain, hosting or cloud services.",
    href: "https://wa.me/2349076646154?text=Hi,%20I%20need%20technical%20support%20with%20my%20Nupat%20account",
    label: "Message support on WhatsApp",
    external: true,
  },
  {
    image: "/contact-3.png",
    title: "Partner with us",
    body: "Interested in working together or exploring a partnership?",
    href: "#send-message",
    label: "Discuss a partnership",
    external: false,
  },
  {
    image: "/contact-4.png",
    title: "Find an answer yourself",
    body: "Guides and documentation that cover the most common questions.",
    href: "https://docs.nupatcloud.com",
    label: "Read the documentation",
    external: true,
  },
];

const SUPPORT_EMAIL = "support@nupatcloud.com";

const SOCIAL_LINK =
  "w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    topic: "General inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // The API has no public contact endpoint, so the form hands the message off
  // to the visitor's email app, prefilled, instead of claiming it was sent.
  const buildMailto = () => {
    const name = `${form.firstName} ${form.lastName}`.trim();
    const lines = [
      `Name: ${name}`,
      `Email: ${form.email}`,
      ...(form.company.trim() ? [`Company: ${form.company.trim()}`] : []),
      "",
      form.message,
    ];
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      form.topic
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = buildMailto();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Hero */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 bg-[#F2F5FC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-6 text-left">
              <h1 className="text-4xl sm:text-5xl font-semibold text-[#031033] mb-5">
                Contact us
              </h1>
              <p className="text-lg text-[#5A6A85] leading-relaxed mb-8 max-w-lg">
                Ask us about choosing a plan, a question about our services, or
                help with an account you already have.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#send-message"
                  id="hero-send-message-btn"
                  className={BTN_PRIMARY}
                >
                  Send a message
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-[480px] lg:max-w-[520px]">
                <Image
                  src="/contact.png"
                  alt="Nupat Cloud customer support representative"
                  width={520}
                  height={520}
                  priority
                  sizes="(min-width: 1024px) 520px, (min-width: 640px) 480px, 90vw"
                  style={{ height: "auto" }}
                  className="w-full h-auto object-contain select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How can we help */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">
              How can we help?
            </h2>
            <p className="text-base text-[#5A6A85] mt-3">
              Pick the closest match and we&apos;ll put you through to the
              right Nupat Cloud team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {HELP_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-[#E2E8F0] p-6 flex flex-col"
              >
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-5 bg-[#F2F5FC]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg text-[#031033] mb-1.5">
                  {card.title}
                </h3>
                <p className="text-sm text-[#5A6A85] leading-relaxed mb-4">
                  {card.body}
                </p>
                <a
                  href={card.href}
                  {...(card.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={CARD_LINK}
                >
                  {card.label}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form and contact details */}
      <section id="send-message" className="py-16 sm:py-24 bg-[#F2F5FC] border-t border-[#E2E8F0] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">
              Send us a message
            </h2>
            <p className="text-base text-[#5A6A85] mt-3">
              Tell us what you need and we&apos;ll reply by email.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 md:p-10">
              {submitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-10 h-10 text-[#12A150] mb-4" />
                  <h3 className="text-2xl font-semibold text-[#031033] mb-2">Your email app is open</h3>
                  <p className="text-base text-[#5A6A85] max-w-md mb-6">
                    We opened your email app with your message ready to send to{" "}
                    {SUPPORT_EMAIL}. Press send there and we&apos;ll reply by
                    email. If nothing opened,{" "}
                    <a href={buildMailto()} className="text-[#1787D4] hover:underline">
                      try again
                    </a>{" "}
                    or{" "}
                    <a
                      href="https://wa.me/2349076646154"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1787D4] hover:underline"
                    >
                      message us on WhatsApp
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        firstName: "",
                        lastName: "",
                        email: "",
                        company: "",
                        topic: "General inquiry",
                        message: "",
                      });
                    }}
                    className="inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
                  >
                    Write another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-first-name" className={LABEL}>
                        First name
                      </label>
                      <input
                        id="contact-first-name"
                        type="text"
                        name="firstName"
                        required
                        autoComplete="given-name"
                        value={form.firstName}
                        onChange={handleChange}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-last-name" className={LABEL}>
                        Last name
                      </label>
                      <input
                        id="contact-last-name"
                        type="text"
                        name="lastName"
                        required
                        autoComplete="family-name"
                        value={form.lastName}
                        onChange={handleChange}
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-email" className={LABEL}>
                        Work email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-company" className={LABEL}>
                        Company name <span className="font-normal text-[#5A6A85]">(optional)</span>
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        name="company"
                        autoComplete="organization"
                        value={form.company}
                        onChange={handleChange}
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <fieldset>
                    <legend className="block text-sm font-medium text-[#031033] mb-2">
                      What can we help you with?
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {TOPIC_OPTIONS.map((item) => {
                        const isSelected = form.topic === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setForm((prev) => ({ ...prev, topic: item }))}
                            className={`h-10 px-3.5 rounded-lg border text-left text-sm transition-colors flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] ${
                              isSelected
                                ? "border-[#1787D4] bg-[#E8F4FC] text-[#031033] font-medium"
                                : "border-[#D5DCE6] bg-white text-[#5A6A85] hover:border-[#B8C3D3] hover:text-[#031033]"
                            }`}
                          >
                            <span>{item}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#1787D4] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor="contact-message" className={LABEL}>
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help"
                      className="w-full px-4 py-3 rounded-lg border border-[#D5DCE6] bg-white text-base sm:text-sm text-[#031033] placeholder:text-[#8A97AD] focus:outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/20 transition-colors resize-y"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      id="contact-form-submit"
                      className={BTN_PRIMARY}
                    >
                      Continue in email app
                      <Send className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-[#5A6A85] mt-2">
                      Opens your email app with this message addressed to{" "}
                      {SUPPORT_EMAIL}.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Contact details */}
            <div className="lg:col-span-4 bg-[#031033] rounded-xl p-6 sm:p-8 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-1.5">
                  Get in touch
                </h3>
                <p className="text-sm text-white/70 mb-8 leading-relaxed">
                  Reach us through any of these channels.
                </p>

                <dl className="space-y-6">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-white/70 shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-sm text-white/70">Head office</dt>
                      <dd className="text-base font-medium text-white mt-0.5">
                        Lagos, Nigeria
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Mail className="w-5 h-5 text-white/70 shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-sm text-white/70">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${SUPPORT_EMAIL}`}
                          className="text-base font-medium text-white mt-0.5 hover:underline block"
                        >
                          support@nupatcloud.com
                        </a>
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Phone className="w-5 h-5 text-white/70 shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-sm text-white/70">Phone</dt>
                      <dd>
                        <a
                          href="tel:+2349076646154"
                          className="text-base font-medium text-white mt-0.5 hover:underline block tabular-nums"
                        >
                          +234 907 664 6154
                        </a>
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="pt-8 mt-8 border-t border-white/15">
                <div className="text-sm text-white/70 mb-3.5">
                  Follow us
                </div>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://facebook.com/nupatcloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className={SOCIAL_LINK}
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com/nupatcloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={SOCIAL_LINK}
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com/nupatcloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X Twitter"
                    className={SOCIAL_LINK}
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://linkedin.com/company/nupatcloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className={SOCIAL_LINK}
                  >
                    <LinkedInIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-3">
                Before you reach out
              </h2>
              <p className="text-base text-[#5A6A85] leading-relaxed max-w-md">
                Answers to the questions our team hears most often.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={faq.q}
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
                      {isOpen ? (
                        <Minus className="w-4 h-4 text-[#1787D4] shrink-0" />
                      ) : (
                        <Plus className="w-4 h-4 text-[#1787D4] shrink-0" />
                      )}
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
        </div>
      </section>

      {/* Bottom banner */}
      <section className="relative overflow-hidden bg-[#FFC75D] min-h-[380px] sm:min-h-[420px] md:min-h-[460px] flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <div className="relative w-full max-w-[540px] sm:max-w-[620px] md:max-w-[720px] h-full">
            <Image
              src="/conatct-5.png"
              alt="Need help getting started"
              fill
              sizes="(min-width: 768px) 720px, (min-width: 640px) 620px, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>

        <div className="absolute inset-0 bg-[#031033]/45 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-12 sm:pt-28 sm:pb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
            Not sure where to start?
          </h2>
          <p className="text-lg text-white max-w-lg mx-auto leading-relaxed mb-6">
            Tell us what you&apos;re building and we&apos;ll point you to the
            right service.
          </p>
          <div>
            <a
              href="#send-message"
              className="inline-flex items-center justify-center h-11 px-5 rounded-lg text-sm font-medium bg-white text-[#031033] hover:bg-[#F2F5FC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#031033]"
            >
              Send us a message
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
