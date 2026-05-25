"use client";
import { useEffect, useRef, useState } from "react";
import { Activity, Cpu, Zap, Shield } from "lucide-react";

const stats = [
  { icon: Activity, value: "99.9%", label: "Uptime", description: "Reliable hosting infrastructure designed for stability.", color: "blue" },
  { icon: Cpu, value: "24/7", label: "Monitoring", description: "Our infrastructure is continuously monitored to prevent downtime.", color: "orange" },
  { icon: Zap, value: "< 2s", label: "Load Time", description: "Launch websites and applications quickly with optimized hosting.", color: "blue" },
  { icon: Shield, value: "100%", label: "Secure", description: "Advanced protection against malware, attacks, and downtime.", color: "orange" },
];

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isOrange = stat.color === "orange";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setVisible(true), index * 100); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  const Icon = stat.icon;

  return (
    <div
      ref={ref}
      className={`feature-card p-7 flex flex-col gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className={`w-12 h-12 flex items-center justify-center ${isOrange ? "bg-[#fff8ee] border border-[#f5d38a]" : "bg-[#f2f5fc] border border-[#dce4f7]"}`}>
        <Icon className={`w-6 h-6 ${isOrange ? "text-[#e8900a]" : "text-[#031033]"}`} strokeWidth={1.8} />
      </div>
      <div>
        <div className={`text-4xl font-extrabold mb-1 ${isOrange ? "text-[#e8900a]" : "text-[#031033]"}`}>{stat.value}</div>
        <div className="text-[#031033] font-semibold text-lg mb-2">{stat.label}</div>
        <p className="text-[#5a6a85] text-sm leading-relaxed">{stat.description}</p>
      </div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section id="stats" className="section-pad section-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-[#e2eaff] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#e8900a]/20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#fd9f09] mb-3">Performance</span> */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031033] mb-4">
            Built for{" "}
            <span className="text-[#e8900a]">Speed, Security &amp; Growth</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
        </div>
      </div>
    </section>
  );
}
