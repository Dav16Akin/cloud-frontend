import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

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
  title,
  subtitle,
}: {
  id: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div id={id} className="mb-8 scroll-mt-28">
      <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">{title}</h2>
      <p className="text-base text-[#5A6A85] mt-2">{subtitle}</p>
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
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-[#031033] mb-2 flex items-baseline gap-2">
        <span className="tabular-nums">{number}.</span>
        {title}
      </h3>
      <div className="text-[#5A6A85] text-base leading-relaxed space-y-3 max-w-[68ch]">
        {children}
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-[#8A97AD]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Divider() {
  return <div className="border-t border-[#E2E8F0] my-12" />;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TermsPage() {
  const lastUpdated = "17 June 2025";

  return (
    <div className="flex flex-col bg-white">
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 bg-[#F2F5FC] border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#031033] mb-4 max-w-4xl">
            Terms, privacy and refund policy
          </h1>
          <p className="text-[#5A6A85] text-lg max-w-2xl">
            These documents govern your use of Nupat Cloud services. Please read
            them carefully before using our platform.
          </p>
          <p className="mt-4 text-sm text-[#5A6A85]">
            Last updated {lastUpdated}
          </p>
        </div>
      </section>

      {/* Body: sidebar + content */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">

            <aside className="lg:w-60 shrink-0">
              <nav aria-label="On this page" className="lg:sticky lg:top-28">
                <p className="text-sm font-medium text-[#031033] mb-3">
                  On this page
                </p>
                <ul className="space-y-1">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block text-sm text-[#5A6A85] hover:text-[#1787D4] py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] rounded"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 rounded-xl border border-[#E2E8F0] bg-[#F2F5FC] p-5">
                  <p className="text-[#031033] text-sm font-medium mb-1">
                    Questions?
                  </p>
                  <p className="text-[#5A6A85] text-sm mb-3 leading-relaxed">
                    Our team can clarify any of these policies.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] hover:underline"
                  >
                    Contact us <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </nav>
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 min-w-0">

              {/* ═══ TERMS & CONDITIONS ═══ */}
              <SectionHeading
                id="terms"
                title="Terms and Conditions"
                subtitle="Effective for all Nupat Cloud services"
              />

              <p className="text-base text-[#5A6A85] leading-relaxed mb-8 max-w-[68ch]">
                These Terms and Conditions govern the use of services provided by{" "}
                <strong className="font-medium text-[#031033]">Nupat Cloud</strong> (&ldquo;Nupat&rdquo;,
                &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), including domain registration, web hosting,
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
                title="Privacy Policy"
                subtitle="In accordance with the Nigeria Data Protection Act (NDPA) 2023"
              />

              <p className="text-base text-[#5A6A85] leading-relaxed mb-8 max-w-[68ch]">
                Nupat Cloud respects your privacy and is committed to protecting
                personal information in accordance with the{" "}
                <strong className="font-medium text-[#031033]">
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
                title="Refund Policy"
                subtitle="30-Day Money Back Guarantee on all hosting plans"
              />

              <div className="rounded-xl bg-[#F2F5FC] border border-[#E2E8F0] p-5 mb-8 flex items-start gap-3 max-w-[68ch]">
                <Check className="w-5 h-5 text-[#12A150] shrink-0 mt-0.5" />
                <p className="text-base text-[#031033] leading-relaxed">
                  We offer a <strong className="font-semibold">no-quibble 30-day Money Back Guarantee</strong> on
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
                  <strong className="font-medium text-[#031033]">15 days</strong> of the time
                  the dispute occurred.
                </p>
              </Clause>

              <Clause number="2" title="Chargebacks">
                <p>
                  Disputed charges to your credit card issuer (chargebacks) will, in
                  Nupat Cloud&rsquo;s valid discretion and under the terms of our SLA, AUP,
                  and TOS, result in service interruption and reconnection fees to
                  restore the desired service.
                </p>
              </Clause>

              <Clause number="3" title="30-Day Money Back Guarantee">
                <p>
                  We are confident you&rsquo;ll be pleased with Nupat Cloud&rsquo;s performance
                  and support. Our 30-day Money Back Guarantee applies to all web
                  hosting plans. Refunds are processed within{" "}
                  <strong className="font-medium text-[#031033]">72 hours</strong> of the
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
              <div className="mt-12 rounded-xl bg-[#031033] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-white font-medium">Have a question about our policies?</p>
                  <p className="text-white/70 text-sm mt-1">
                    Our support team can clarify anything in these documents.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-sm font-medium bg-white text-[#031033] hover:bg-[#F2F5FC] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#031033]"
                >
                  Contact support <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
