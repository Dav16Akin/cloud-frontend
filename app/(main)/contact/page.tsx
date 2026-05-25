"use client";
import { useState } from "react";
import { Mail, MapPin, Phone, Send, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@nupatcloud.com",
    href: "mailto:hello@nupatcloud.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+234 800 000 0000",
    href: "tel:+2348000000000",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Lagos, Nigeria 🇳🇬",
    href: null,
  },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L2.058 2.25H8.08l4.265 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

const socials = [
  { Icon: XIcon, label: "X / Twitter", href: "https://twitter.com/nupatcloud" },
  { Icon: LinkedInIcon, label: "LinkedIn", href: "https://linkedin.com/company/nupatcloud" },
  { Icon: Globe, label: "Website", href: "https://nupatcloud.com" },
];


type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate async submission
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <>
      {/* Page header */}
      <section className="pt-28 pb-14 bg-[#f6f9ff] border-b border-[#e2eaff] relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
        {/* Left amber accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e8900a]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#e8900a] mb-3">
            Get In Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#031033] leading-tight mb-4">
            Contact Us
          </h1>
          <p className="text-[#5a6a85] text-lg max-w-xl">
            Have a question or need help? Reach out to our team — we typically respond within 2 business hours.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="section-pad bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-0 border border-[#e2eaff]">

            {/* ── Left: Contact info ──────────────────────────────────── */}
            <div className="lg:col-span-2 bg-[#031033] p-8 lg:p-10 flex flex-col gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Contact Information</h2>
                <p className="text-[#9ba8c0] text-sm leading-relaxed">
                  Reach out via any of the channels below. Our team is based in Lagos, Nigeria and serves businesses across Africa.
                </p>
              </div>

              {/* Contact details */}
              <div className="flex flex-col gap-5">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[#e8900a]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#9ba8c0] mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-white text-sm font-medium hover:text-[#e8900a] transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-white text-sm font-medium">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Socials */}
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#9ba8c0] mb-3">Follow Us</p>
                <div className="flex items-center gap-3">
                  {socials.map(({ Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-white/10 flex items-center justify-center text-[#9ba8c0] hover:text-white hover:bg-white/20 transition-all"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Decorative amber bar */}
              <div className="mt-auto h-1 w-16 bg-[#e8900a]" />
            </div>

            {/* ── Right: Form ─────────────────────────────────────────── */}
            <div className="lg:col-span-3 bg-white p-8 lg:p-10">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 bg-emerald-50 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#031033] mb-2">Message Sent!</h3>
                  <p className="text-[#5a6a85] text-sm max-w-sm mb-6">
                    Thanks for reaching out. Our team will get back to you within 2 business hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="btn-primary text-sm py-2.5 px-6"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h2 className="text-xl font-bold text-[#031033] mb-1">Send a Message</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-name" className="text-xs font-semibold text-[#031033] tracking-wide uppercase">
                        Full Name <span className="text-[#e8900a]">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="px-4 py-2.5 border border-[#e2eaff] bg-[#f6f9ff] text-sm text-[#031033] placeholder-[#9ba8c0] focus:outline-none focus:border-[#e8900a] transition-colors"
                      />
                    </div>
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-email" className="text-xs font-semibold text-[#031033] tracking-wide uppercase">
                        Email Address <span className="text-[#e8900a]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="px-4 py-2.5 border border-[#e2eaff] bg-[#f6f9ff] text-sm text-[#031033] placeholder-[#9ba8c0] focus:outline-none focus:border-[#e8900a] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-subject" className="text-xs font-semibold text-[#031033] tracking-wide uppercase">
                      Subject <span className="text-[#e8900a]">*</span>
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="px-4 py-2.5 border border-[#e2eaff] bg-[#f6f9ff] text-sm text-[#031033] focus:outline-none focus:border-[#e8900a] transition-colors appearance-none"
                    >
                      <option value="" disabled>Select a topic…</option>
                      <option value="hosting">Web Hosting</option>
                      <option value="domains">Domain Registration</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="technical">Technical Support</option>
                      <option value="sales">Sales Enquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-message" className="text-xs font-semibold text-[#031033] tracking-wide uppercase">
                      Message <span className="text-[#e8900a]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you…"
                      className="px-4 py-2.5 border border-[#e2eaff] bg-[#f6f9ff] text-sm text-[#031033] placeholder-[#9ba8c0] focus:outline-none focus:border-[#e8900a] transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <p className="text-xs text-[#9ba8c0]">
                      We typically respond within 2 business hours.
                    </p>
                    <button
                      id="contact-submit"
                      type="submit"
                      disabled={loading}
                      className="btn-primary text-sm py-3 px-6 shrink-0 disabled:opacity-70"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Sending…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Send Message
                          <Send className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ strip */}
      <section className="section-pad bg-[#f6f9ff] border-t border-[#e2eaff]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#031033] font-semibold text-lg mb-2">Looking for quick answers?</p>
          <p className="text-[#5a6a85] text-sm mb-6">
            Browse our documentation or open a support ticket directly from your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/help" className="btn-primary text-sm py-2.5 px-6">
              Help Center
            </Link>
            <Link href="/login" className="btn-outline text-sm py-2.5 px-6">
              Open a Ticket
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
