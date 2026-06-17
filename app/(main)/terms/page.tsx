import type { Metadata } from "next";
import Link from "next/link";
import { Scale, Shield, RefreshCw, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Nupat Cloud",
  description:
    "Read the Terms and Conditions, Privacy Policy, and Refund Policy governing the use of Nupat Cloud services.",
};

// ── Section data ────────────────────────────────────────────────────────────

const toc = [
  { id: "terms", label: "Terms & Conditions" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "refund", label: "Refund Policy" },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({
  id,
  icon: Icon,
  title,
  subtitle,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div id={id} className="flex items-start gap-4 mb-8 scroll-mt-28">
      <div className="w-10 h-10 bg-[#fff8ee] border border-[#e8900a]/30 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-[#e8900a]" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-[#031033]">{title}</h2>
        <p className="text-sm text-[#9ba8c0] mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Clause({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <h3 className="text-base font-bold text-[#031033] mb-2 flex items-baseline gap-2">
        <span className="text-[#e8900a] font-extrabold tabular-nums">{number}.</span>
        {title}
      </h3>
      <div className="text-[#5a6a85] text-sm leading-relaxed space-y-2 pl-5 border-l-2 border-[#e2eaff]">
        {children}
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-1.5 w-1.5 h-1.5 bg-[#e8900a] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <div className="border-t border-[#e2eaff] my-10" />;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TermsPage() {
  const lastUpdated = "17 June 2025";

  return (
    <div className="flex flex-col bg-white">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 section-navy-tint overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="trust-badge mb-4 inline-flex">
            <Scale className="w-3.5 h-3.5" />
            Legal Documents
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#031033] mb-4 leading-tight">
            Terms, Privacy &{" "}
            <span className="gradient-text">Refund Policy</span>
          </h1>
          <p className="text-[#5a6a85] text-lg max-w-xl mx-auto">
            These documents govern your use of Nupat Cloud services. Please read
            them carefully before using our platform.
          </p>
          <p className="mt-4 text-xs text-[#9ba8c0]">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* ── Body: sidebar + content ── */}
      <section className="section-pad section-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* ── Sticky sidebar ── */}
            <aside className="lg:w-64 shrink-0">
              <div className="lg:sticky lg:top-28 space-y-1">
                <p className="text-[10px] font-bold text-[#9ba8c0] uppercase tracking-widest mb-3">
                  On this page
                </p>
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 text-sm text-[#5a6a85] hover:text-[#e8900a] py-1.5 border-l-2 border-[#e2eaff] hover:border-[#e8900a] pl-3 transition-all"
                  >
                    {item.label}
                  </a>
                ))}

                <div className="pt-6">
                  <div className="bg-[#031033] p-4">
                    <p className="text-white text-xs font-semibold mb-1">
                      Questions?
                    </p>
                    <p className="text-[#9ba8c0] text-xs mb-3 leading-relaxed">
                      Our team is happy to clarify any of our policies.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#e8900a] hover:underline"
                    >
                      Contact us <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 min-w-0">

              {/* ═══ TERMS & CONDITIONS ═══ */}
              <SectionHeading
                id="terms"
                icon={Scale}
                title="Terms and Conditions"
                subtitle="Effective for all Nupat Cloud services"
              />

              <p className="text-sm text-[#5a6a85] leading-relaxed mb-7">
                These Terms and Conditions govern the use of services provided by{" "}
                <strong className="text-[#031033]">Nupat Cloud</strong> ("Nupat",
                "we", "our", or "us"), including domain registration, web hosting,
                cloud infrastructure, managed services, software solutions, and
                related products.
              </p>

              <Clause number="1" title="Acceptance of Terms">
                <p>
                  By accessing or using our services, you agree to be legally bound
                  by these Terms and Conditions.
                </p>
              </Clause>

              <Clause number="2" title="Services">
                <p>Nupat may provide:</p>
                <BulletList
                  items={[
                    "Domain name registration services",
                    "Shared hosting services",
                    "VPS and dedicated server hosting",
                    "Cloud infrastructure services",
                    "Email hosting",
                    "Managed IT services",
                    "Software development services",
                  ]}
                />
              </Clause>

              <Clause number="3" title="Customer Responsibilities">
                <p>Customers agree to:</p>
                <BulletList
                  items={[
                    "Provide accurate information",
                    "Maintain account security",
                    "Comply with applicable laws and regulations",
                    "Refrain from using services for unlawful activities",
                  ]}
                />
              </Clause>

              <Clause number="4" title="Prohibited Activities">
                <p>Customers shall not:</p>
                <BulletList
                  items={[
                    "Distribute malware or malicious software",
                    "Conduct phishing or fraud",
                    "Send unsolicited bulk emails",
                    "Host illegal content",
                    "Infringe intellectual property rights",
                    "Engage in activities that may disrupt network operations",
                  ]}
                />
              </Clause>

              <Clause number="5" title="Service Suspension">
                <p>
                  Nupat reserves the right to suspend or terminate services where a
                  customer violates these Terms or where required by law, court
                  order, regulatory directive, or security requirements.
                </p>
              </Clause>

              <Clause number="6" title="Limitation of Liability">
                <p>
                  Nupat shall not be liable for indirect, incidental, consequential,
                  or special damages arising from the use of our services.
                </p>
              </Clause>

              <Clause number="7" title="Governing Law">
                <p>
                  The laws of the Federal Republic of Nigeria shall govern these
                  Terms.
                </p>
              </Clause>

              <Clause number="8" title="Amendments">
                <p>
                  Nupat may amend these Terms at any time by publishing updated
                  versions on its website.
                </p>
              </Clause>

              <Divider />

              {/* ═══ PRIVACY POLICY ═══ */}
              <SectionHeading
                id="privacy"
                icon={Shield}
                title="Privacy Policy"
                subtitle="In accordance with the Nigeria Data Protection Act (NDPA) 2023"
              />

              <p className="text-sm text-[#5a6a85] leading-relaxed mb-7">
                Nupat Cloud respects your privacy and is committed to protecting
                personal information in accordance with the{" "}
                <strong className="text-[#031033]">
                  Nigeria Data Protection Act (NDPA) 2023
                </strong>
                .
              </p>

              <Clause number="1" title="Information We Collect">
                <p>We may collect:</p>
                <BulletList
                  items={[
                    "Name",
                    "Email address",
                    "Phone number",
                    "Residential or business address",
                    "Means of identification",
                    "Company registration documents",
                    "Payment information",
                    "IP addresses",
                    "Website usage information",
                  ]}
                />
              </Clause>

              <Clause number="2" title="Purpose of Collection">
                <p>We collect information to:</p>
                <BulletList
                  items={[
                    "Register domain names",
                    "Provide hosting services",
                    "Process payments",
                    "Conduct KYC verification",
                    "Prevent fraud",
                    "Comply with legal obligations",
                  ]}
                />
              </Clause>

              <Clause number="3" title="Data Security">
                <p>
                  We implement technical and organisational safeguards, including:
                </p>
                <BulletList
                  items={[
                    "Encryption",
                    "Access controls",
                    "Firewalls",
                    "Multi-factor authentication",
                    "Secure backups",
                  ]}
                />
              </Clause>

              <Clause number="4" title="Sharing of Information">
                <p>Information may be shared with:</p>
                <BulletList
                  items={[
                    "NiRA",
                    "Domain registries",
                    "Payment processors",
                    "Government authorities where legally required",
                  ]}
                />
              </Clause>

              <Clause number="5" title="Data Subject Rights">
                <p>Customers have the right to:</p>
                <BulletList
                  items={[
                    "Access personal data",
                    "Correct inaccurate data",
                    "Request deletion where legally permissible",
                    "Object to processing",
                    "Lodge complaints with the relevant authorities",
                  ]}
                />
              </Clause>

              <Divider />

              {/* ═══ REFUND POLICY ═══ */}
              <SectionHeading
                id="refund"
                icon={RefreshCw}
                title="Refund Policy"
                subtitle="30-Day Money Back Guarantee on all hosting plans"
              />

              <div className="bg-emerald-50 border border-emerald-200 p-4 mb-7 flex items-start gap-3">
                <div className="w-5 h-5 bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                  We offer a <strong>no-quibble 30-day Money Back Guarantee</strong> on
                  all web hosting plans. You will receive a refund of hosting fees
                  (remainder of the term) within 72 hours of requesting it.
                </p>
              </div>

              <Clause number="1" title="Non-Refundable Payments">
                <p>
                  All payments to Nupat Cloud are non-refundable unless covered by
                  the 30-day Money Back Guarantee. This includes any setup fees and
                  monthly fees, regardless of usage. All billing disputes must be
                  reported within{" "}
                  <strong className="text-[#031033]">15 days</strong> of the time
                  the dispute occurred.
                </p>
              </Clause>

              <Clause number="2" title="Chargebacks">
                <p>
                  Disputed charges to your credit card issuer (chargebacks) will, in
                  Nupat Cloud's valid discretion and under the terms of our SLA, AUP,
                  and TOS, result in service interruption and reconnection fees to
                  restore the desired service.
                </p>
              </Clause>

              <Clause number="3" title="30-Day Money Back Guarantee">
                <p>
                  We are confident you'll be pleased with Nupat Cloud's performance
                  and support. Our 30-day Money Back Guarantee applies to all web
                  hosting plans. Refunds are processed within{" "}
                  <strong className="text-[#031033]">72 hours</strong> of the
                  request.
                </p>
              </Clause>

              <Clause number="4" title="Domain Registration Fees">
                <p>
                  Refunds exclude any fees for domain registration. Your domain will
                  still belong to you and can be used with any hosting provider by
                  updating the nameservers in the client area.
                </p>
              </Clause>

              {/* Bottom CTA */}
              <div className="mt-10 bg-[#031033] border-l-4 border-[#e8900a] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">Have a question about our policies?</p>
                  <p className="text-[#9ba8c0] text-sm mt-0.5">
                    Our support team is available to clarify anything in these documents.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap shrink-0 flex items-center gap-2"
                >
                  Contact Support <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
