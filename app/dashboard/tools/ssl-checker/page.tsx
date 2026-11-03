"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertCircle, Loader2, ListChecks } from "lucide-react";

/**
 * There is no backend SSL-check endpoint, and a browser cannot inspect another
 * site's TLS handshake. Results come from public certificate transparency (CT)
 * logs via crt.sh, so they show the most recently logged certificate for the
 * domain, not the protocol, cipher or chain the server actually presents.
 */

interface CrtShEntry {
  id: number;
  issuer_name: string;
  common_name: string;
  name_value: string;
  not_before: string;
  not_after: string;
  serial_number: string;
}

interface SslCertData {
  domain: string;
  crtShId: number;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  daysRemaining: number;
  sans: string[];
}

const CRT_SH_TIMEOUT_MS = 20000;

/** crt.sh timestamps are UTC without a zone suffix. */
function parseCrtDate(value: string): Date {
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** "C=US, O=Let's Encrypt, CN=R11" → "Let's Encrypt (R11)" */
function formatIssuer(issuerName: string): string {
  const parts: Record<string, string> = {};
  for (const seg of issuerName.split(/,\s*(?=[A-Za-z]+=)/)) {
    const idx = seg.indexOf("=");
    if (idx > 0) parts[seg.slice(0, idx).trim().toUpperCase()] = seg.slice(idx + 1).trim();
  }
  const org = parts.O;
  const cn = parts.CN;
  if (org && cn && org !== cn) return `${org} (${cn})`;
  return org || cn || issuerName;
}

/** Does a certificate name (possibly a wildcard) cover the domain? */
function nameCovers(name: string, domain: string): boolean {
  const n = name.trim().toLowerCase();
  if (n === domain) return true;
  if (n.startsWith("*.")) {
    const base = n.slice(2);
    const rest = domain.endsWith(`.${base}`) ? domain.slice(0, -(base.length + 1)) : null;
    return !!rest && !rest.includes(".");
  }
  return false;
}

async function lookupCertificate(domain: string): Promise<SslCertData | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRT_SH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(
      `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json&exclude=expired`,
      { signal: controller.signal, headers: { Accept: "application/json" } },
    );
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    throw new Error(`Certificate transparency lookup failed (HTTP ${res.status}).`);
  }
  const text = await res.text();
  let entries: CrtShEntry[];
  try {
    entries = text.trim() ? (JSON.parse(text) as CrtShEntry[]) : [];
  } catch {
    throw new Error("Certificate transparency service returned an unexpected response.");
  }
  if (!Array.isArray(entries)) return null;

  const now = Date.now();
  const matching = entries
    .filter((e) => (e.name_value || "").split("\n").some((n) => nameCovers(n, domain)))
    .map((e) => ({ e, from: parseCrtDate(e.not_before), to: parseCrtDate(e.not_after) }))
    .filter(
      ({ from, to }) =>
        !Number.isNaN(from.getTime()) &&
        !Number.isNaN(to.getTime()) &&
        from.getTime() <= now &&
        to.getTime() > now,
    )
    .sort((a, b) => b.from.getTime() - a.from.getTime());

  const latest = matching[0];
  if (!latest) return null;

  const sans = Array.from(
    new Set(
      (latest.e.name_value || "")
        .split("\n")
        .map((n) => n.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

  return {
    domain,
    crtShId: latest.e.id,
    issuer: formatIssuer(latest.e.issuer_name || ""),
    validFrom: latest.from,
    validTo: latest.to,
    daysRemaining: Math.floor((latest.to.getTime() - now) / 86400000),
    sans,
  };
}

export default function SslCheckerToolPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certData, setCertData] = useState<SslCertData | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/[/?#:].*$/, "")
      .replace(/\.$/, "");
    if (!clean) return;
    if (!/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(clean)) {
      setCertData(null);
      setError("Enter a valid domain name, for example example.com.");
      return;
    }

    setLoading(true);
    setError(null);
    setCertData(null);

    try {
      const result = await lookupCertificate(clean);
      if (result) {
        setCertData(result);
      } else {
        setError(
          `No currently valid certificate for ${clean} was found in public certificate transparency logs.`,
        );
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(
          "The certificate transparency service took too long to respond. Please try again in a moment.",
        );
      } else if (err instanceof TypeError) {
        setError(
          "Could not reach the certificate transparency service. Check your connection and try again.",
        );
      } else {
        setError(err instanceof Error ? err.message : "Certificate lookup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const expiringSoon = certData ? certData.daysRemaining <= 14 : false;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      <div>
        <Link
          href="/dashboard/tools"
          id="btn-back-tools"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to tools
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">SSL certificate checker</h1>
        <p className="text-sm text-[#5A6A85] mt-1">
          Look up the latest publicly logged SSL certificate for any domain: issuer, validity dates and days until expiry.
        </p>
      </div>

      {/* Input bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
          <input
            id="input-domain"
            type="text"
            placeholder="Enter domain name (e.g. example.com or domain.com.ng)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="h-10 px-5 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Check SSL
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-[#FDECEC] border border-[#DC2626]/20 rounded-lg px-4 py-3 flex items-center gap-2 text-[#C21F1F] text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results or Empty prompt */}
      {certData ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-[#031033] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5A6A85]" /> Latest certificate
                </h3>
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
                  <span
                    aria-hidden
                    className={`h-2 w-2 shrink-0 rounded-full ${expiringSoon ? "bg-[#E8900A]" : "bg-[#12A150]"}`}
                  />
                  {expiringSoon ? "Expiring soon" : "Within validity period"}
                </span>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-[#EEF2F7] pb-3">
                  <span className="text-[#5A6A85]">Hostname</span>
                  <span className="font-mono font-medium text-right break-all text-[#031033]">{certData.domain}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-[#EEF2F7] pb-3">
                  <span className="text-[#5A6A85]">Issuer</span>
                  <span className="text-right text-[#031033]">{certData.issuer || "—"}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-[#EEF2F7] pb-3">
                  <span className="text-[#5A6A85]">Valid from</span>
                  <span className="tabular-nums text-[#031033]">{formatDate(certData.validFrom)}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-[#EEF2F7] pb-3">
                  <span className="text-[#5A6A85]">Expires</span>
                  <span className="tabular-nums text-[#031033]">{formatDate(certData.validTo)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#5A6A85]">Days remaining</span>
                  <span className="font-medium tabular-nums text-[#031033]">
                    {certData.daysRemaining} day{certData.daysRemaining === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <h3 className="text-base font-semibold text-[#031033] flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-[#5A6A85]" /> Names covered
              </h3>
              <div className="flex flex-col gap-1.5 text-sm">
                <span className="text-[#5A6A85]">Subject alternative names (SANs)</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {certData.sans.length > 0 ? (
                    certData.sans.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-[#F2F5FC] text-[#031033] font-mono text-xs">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#5A6A85]">—</span>
                  )}
                </div>
              </div>
              <a
                href={`https://crt.sh/?id=${certData.crtShId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#1787D4] hover:text-[#1370B5] w-fit"
              >
                View log entry on crt.sh
              </a>
            </div>
          </div>

          <p className="text-xs text-[#5A6A85]">
            From public certificate transparency logs. This shows the most recently issued certificate for the
            domain; it does not confirm which certificate the server presents, its TLS version or chain validity.
          </p>
        </div>
      ) : !loading && !error && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] px-6 py-10 text-center flex flex-col items-center justify-center text-[#5A6A85]">
          <p className="text-sm font-medium text-[#031033]">No domain checked yet</p>
          <p className="text-sm text-[#5A6A85] mt-1 max-w-sm">
            Enter a domain name above to look up its latest SSL certificate, issuer and days until expiry.
          </p>
        </div>
      )}
    </div>
  );
}
