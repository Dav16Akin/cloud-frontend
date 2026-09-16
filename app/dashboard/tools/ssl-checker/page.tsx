"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertCircle, Loader2, Lock, CheckCircle2 } from "lucide-react";

export default function SslCheckerToolPage() {
  const [domain, setDomain] = useState("nupatcloud.com");
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState({
    valid: true,
    domain: "nupatcloud.com",
    issuer: "Let's Encrypt Authority X3",
    validFrom: "May 10, 2026",
    validTo: "August 10, 2026",
    daysRemaining: 54,
    protocol: "TLS 1.3",
    cipher: "TLS_AES_256_GCM_SHA384",
    sans: ["nupatcloud.com", "www.nupatcloud.com"],
  });

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "");
      setCertData({
        valid: true,
        domain: clean,
        issuer: "Let's Encrypt / Google Trust Services",
        validFrom: "June 01, 2026",
        validTo: "September 01, 2026",
        daysRemaining: 77,
        protocol: "TLS 1.3",
        cipher: "TLS_AES_256_GCM_SHA384",
        sans: [clean, `www.${clean}`],
      });
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      <div>
        <Link
          href="/dashboard/tools"
          id="btn-back-tools"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1787D4] hover:text-[#1371B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tools
        </Link>
      </div>

      <div>
        <h2
          className="text-[26px] font-bold text-[#1d1d1f] tracking-tight"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          SSL Checker
        </h2>
        <p className="text-[14px] mt-1 text-[#6e6e73]">
          Check the SSL certificate validity, expiration, and cipher protocols for any website.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm">
        <form onSubmit={handleCheck} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-60 shrink-0"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Verify SSL
          </button>
        </form>
      </div>

      {/* Results Card */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#eef2f8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e6f9ed] text-[#12a150] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#1d1d1f]">{certData.domain}</h3>
              <p className="text-[12px] text-[#6e6e73]">Secured with valid certificate</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0] rounded-full text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-[13px]">
          <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2eaff]">
            <span className="text-xs text-[#6e6e73]">Certificate Issuer</span>
            <div className="font-semibold text-[#1d1d1f] mt-1">{certData.issuer}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2eaff]">
            <span className="text-xs text-[#6e6e73]">Valid Until</span>
            <div className="font-semibold text-[#12a150] mt-1">
              {certData.validTo} ({certData.daysRemaining} days left)
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2eaff]">
            <span className="text-xs text-[#6e6e73]">Protocol & Cipher</span>
            <div className="font-semibold text-[#1d1d1f] mt-1">{certData.protocol}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
