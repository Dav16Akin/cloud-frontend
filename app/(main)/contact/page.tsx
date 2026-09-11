"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  Key,
  Users,
  BookOpen,
  Plus,
  Minus,
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
  "General Inquiry",
  "Sales",
  "Technical Support",
  "Domains",
  "Web Hosting",
  "Cloud Infrastructure",
  "Business Solutions",
  "Partnerships",
  "Other",
];

const FAQS = [
  {
    q: "How quickly will I get a response?",
    a: "Our team will respond as soon as possible during support hours (typically within 1–2 hours for general inquiries, and immediately via 24/7 priority channels).",
  },
  {
    q: "Can I contact support about my domain or hosting?",
    a: "Yes. Our support team can assist with questions related to your domain setup, DNS records, cPanel hosting, SSL certificates, and digital services.",
  },
  {
    q: "Can I speak with someone about choosing a solution?",
    a: "Yes. Contact our sales team for personalized help finding the right hosting plan, cloud infrastructure, or enterprise setup for your business.",
  },
  {
    q: "Where can I find technical documentation?",
    a: "Visit our documentation portal (docs.nupatcloud.com) for comprehensive product guides, tutorials, API references, and developer resources.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    topic: "General Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission delay
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* ── 1. Hero Section ── */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#f2f7fc] via-[#f8faff] to-white border-b border-[#e2eaff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#031033] tracking-tight mb-5">
                Contact Us
              </h1>
              <p className="text-base sm:text-lg text-[#5a6a85] leading-relaxed mb-8 max-w-lg">
                Whether you need help choosing a solution, have a question about our services, or need support, our team is here to help.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#send-message"
                  id="hero-send-message-btn"
                  className="btn-primary px-8 py-3.5 rounded-xl font-semibold text-sm shadow-xs transition-all active:scale-98"
                >
                  Send Message
                </a>
              </div>
            </div>

            {/* Right Column (Hero Photo) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-[480px] lg:max-w-[520px]">
                <Image
                  src="/contact.png"
                  alt="Nupat Cloud customer support representative"
                  width={520}
                  height={520}
                  priority
                  style={{ height: "auto" }}
                  className="w-full h-auto object-contain select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. "How can we help?" 4-Card Section ── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#031033] tracking-tight">
              How can we help?
            </h2>
            <p className="text-sm sm:text-base text-[#5a6a85] mt-2.5">
              Choose the best route and we&apos;ll connect you with the right Nupat Cloud team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Card 1: Talk to our team */}
            <div className="bg-white rounded-3xl border border-[#e2eaff] p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center mb-3.5">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                  <Image
                    src="/contact-1.png"
                    alt="Talk to our team"
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-base text-[#031033] mb-1.5">
                  Talk to our team
                </h3>
                <p className="text-xs text-[#5a6a85] leading-relaxed mb-4">
                  Have questions about our products, pricing, or the right solution for your business?
                </p>
              </div>
              <a
                href="#send-message"
                className="text-xs font-bold text-[#1787D4] group-hover:text-[#1370B5] inline-flex items-center gap-1 mt-auto pt-2 hover:underline"
              >
                Talk to Sales &rarr;
              </a>
            </div>

            {/* Card 2: Get technical support */}
            <div className="bg-white rounded-3xl border border-[#e2eaff] p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center mb-3.5">
                  <Key className="w-4.5 h-4.5" />
                </div>
                <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                  <Image
                    src="/conatct-2.png"
                    alt="Get technical support"
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-base text-[#031033] mb-1.5">
                  Get technical support
                </h3>
                <p className="text-xs text-[#5a6a85] leading-relaxed mb-4">
                  Need help with your account, website, domain, hosting, or cloud services?
                </p>
              </div>
              <a
                href="https://wa.me/2349076646154?text=Hi,%20I%20need%20technical%20support%20with%20my%20Nupat%20account"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#1787D4] group-hover:text-[#1370B5] inline-flex items-center gap-1 mt-auto pt-2 hover:underline"
              >
                Get Support &rarr;
              </a>
            </div>

            {/* Card 3: Partner with us */}
            <div className="bg-white rounded-3xl border border-[#e2eaff] p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center mb-3.5">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                  <Image
                    src="/contact-3.png"
                    alt="Partner with us"
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-base text-[#031033] mb-1.5">
                  Partner with us
                </h3>
                <p className="text-xs text-[#5a6a85] leading-relaxed mb-4">
                  Interested in working together or exploring a partnership opportunity?
                </p>
              </div>
              <a
                href="#send-message"
                className="text-xs font-bold text-[#1787D4] group-hover:text-[#1370B5] inline-flex items-center gap-1 mt-auto pt-2 hover:underline"
              >
                Explore Partnerships &rarr;
              </a>
            </div>

            {/* Card 4: Find an answer yourself */}
            <div className="bg-white rounded-3xl border border-[#e2eaff] p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center mb-3.5">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                  <Image
                    src="/contact-4.png"
                    alt="Find an answer yourself"
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-base text-[#031033] mb-1.5">
                  Find an answer yourself
                </h3>
                <p className="text-xs text-[#5a6a85] leading-relaxed mb-4">
                  Browse guides and documentation for quick answers to common questions.
                </p>
              </div>
              <a
                href="https://docs.nupatcloud.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#1787D4] group-hover:text-[#1370B5] inline-flex items-center gap-1 mt-auto pt-2 hover:underline"
              >
                Visit Documentation &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. "Send us a message" Form & "Get in Touch" Card ── */}
      <section id="send-message" className="py-16 sm:py-20 bg-[#f8faff] border-t border-[#e2eaff] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#031033] tracking-tight">
              Send us a message
            </h2>
            <p className="text-sm sm:text-base text-[#5a6a85] mt-2">
              Tell us what you need help with and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Form Card (Left) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e2eaff] p-6 sm:p-8 md:p-10 shadow-xs">
              {submitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#031033] mb-2">Message Sent!</h3>
                  <p className="text-sm text-[#5a6a85] max-w-md mb-6">
                    Thank you for reaching out. One of our team members will review your message and reply via email shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        firstName: "",
                        lastName: "",
                        email: "",
                        company: "",
                        topic: "General Inquiry",
                        message: "",
                      });
                    }}
                    className="btn-primary py-2.5 px-6 rounded-xl text-xs font-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Row 1: Name fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#031033] mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base sm:text-sm text-[#031033] placeholder:text-slate-400 focus:outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/10 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#031033] mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base sm:text-sm text-[#031033] placeholder:text-slate-400 focus:outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/10 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#031033] mb-1.5">
                        Work Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base sm:text-sm text-[#031033] placeholder:text-slate-400 focus:outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/10 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#031033] mb-1.5">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Enter your company name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base sm:text-sm text-[#031033] placeholder:text-slate-400 focus:outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/10 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 3: Topic selection */}
                  <div>
                    <label className="block text-xs font-bold text-[#031033] mb-2">
                      What can we help you with?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {TOPIC_OPTIONS.map((item) => {
                        const isSelected = form.topic === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, topic: item }))}
                            className={`px-3.5 py-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "border-[#1787D4] bg-[#e8f4fc] text-[#1787D4] font-semibold"
                                : "border-slate-200 bg-white text-[#5a6a85] hover:border-slate-300 hover:text-[#031033]"
                            }`}
                          >
                            <span>{item}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#1787D4] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 4: Message */}
                  <div>
                    <label className="block text-xs font-bold text-[#031033] mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base sm:text-sm text-[#031033] placeholder:text-slate-400 focus:outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/10 transition-colors resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      id="contact-form-submit"
                      className="btn-primary py-3.5 px-8 text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center gap-2"
                    >
                      {loading ? "Sending..." : "Send Message"}
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* "Get in Touch" Card (Right) */}
            <div className="lg:col-span-4 bg-[#0B66A3] rounded-3xl p-7 sm:p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
              {/* Subtle ambient light */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                {/* Badge Icon */}
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white mb-6">
                  <MessageSquare className="w-5 h-5" />
                </div>

                <h3 className="text-2xl font-extrabold text-white mb-1.5">
                  Get in Touch
                </h3>
                <p className="text-xs text-white/80 mb-8 leading-relaxed">
                  Reach us through any channel below.
                </p>

                {/* Contact List */}
                <div className="space-y-6">
                  {/* Head Office */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        HEAD OFFICE
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        Lagos, Nigeria
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        EMAIL
                      </div>
                      <a
                        href="mailto:support@nupatcloud.com"
                        className="text-sm font-semibold text-white mt-0.5 hover:underline block"
                      >
                        support@nupatcloud.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        PHONE
                      </div>
                      <a
                        href="tel:+2349076646154"
                        className="text-sm font-semibold text-white mt-0.5 hover:underline block"
                      >
                        +234 907 664 6154
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-8 mt-8 border-t border-white/15 relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-3.5">
                  SOCIAL CHANNELS
                </div>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://facebook.com/nupatcloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com/nupatcloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com/nupatcloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X Twitter"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://linkedin.com/company/nupatcloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <LinkedInIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. "Before you reach out" (FAQ Accordion) ── */}
      <section className="py-16 sm:py-24 bg-white border-t border-[#e2eaff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Header */}
            <div className="lg:col-span-5">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#031033] tracking-tight mb-3">
                Before you reach out
              </h2>
              <p className="text-sm sm:text-base text-[#5a6a85] leading-relaxed max-w-md">
                Find quick answers to the questions our team hears most often.
              </p>
            </div>

            {/* Right Accordion List */}
            <div className="lg:col-span-7 space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={faq.q}
                    className="bg-[#f8faff] rounded-2xl border border-[#e2eaff] overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full py-4.5 px-5 sm:px-6 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-[#f2f7fc] transition-colors"
                    >
                      <span className="font-bold text-sm sm:text-[15px] text-[#031033]">
                        {faq.q}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#1787D4] shrink-0">
                        {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#5a6a85] leading-relaxed border-t border-slate-100/80">
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

      {/* ── 5. Bottom Banner ("Need help getting started?") ── */}
      <section className="relative overflow-hidden bg-[#FEC603] min-h-[380px] sm:min-h-[420px] md:min-h-[460px] flex items-center justify-center">
        {/* Centered Image Background matching mockup framing */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <div className="relative w-full max-w-[540px] sm:max-w-[620px] md:max-w-[720px] h-full">
            <Image
              src="/conatct-5.png"
              alt="Need help getting started"
              fill
              priority
              className="object-cover object-top"
            />
          </div>
        </div>

        {/* Transparent Dark Overlay for enhanced text pop & contrast */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        {/* Centered Content Overlay matching design mockup */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-12 sm:pt-28 sm:pb-16 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mb-2.5">
            Need help getting started?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/95 font-medium max-w-lg mx-auto leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] mb-6">
            Explore our solutions or contact our team to find the right place to begin.
          </p>
          <div>
            <a
              href="#send-message"
              className="inline-flex items-center justify-center bg-white text-[#0B66A3] hover:text-[#031033] hover:bg-slate-50 font-semibold px-7 py-3 rounded-lg text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
