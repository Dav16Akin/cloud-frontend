const stats = [
  {
    value: "99.99%",
    label: "Uptime SLA",
  },
  {
    value: "8+",
    label: "Data center locations",
  },
  {
    value: "500K+",
    label: "Virtual servers deployed",
  },
  {
    value: "24/7",
    label: "Engineer support",
  },
];

export default function VpsStatsSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#F2F5FC] border-t border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center max-w-5xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse items-center justify-center">
              <dt className="text-sm text-[#5A6A85] mt-2">{stat.label}</dt>
              <dd className="text-3xl sm:text-4xl font-semibold text-[#031033] leading-none tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
