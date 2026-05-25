import { Quote } from "lucide-react";

const testimonials = [
  {
    id: "t1",
    quote:
      "Nupat Cloud helped us launch our business website quickly with reliable support and smooth onboarding.",
    name: "Adaeze Okonkwo",
    title: "Business Owner",
    initials: "AO",
    color: "blue",
  },
  {
    id: "t2",
    quote:
      "The hosting performance and support experience exceeded our expectations. A truly reliable platform.",
    name: "Emmanuel Adeyemi",
    title: "Agency Founder",
    initials: "EA",
    color: "orange",
  },
  {
    id: "t3",
    quote:
      "A reliable platform for managing client websites and domains. The cPanel access and backups are great.",
    name: "Chukwuemeka Obi",
    title: "Web Developer",
    initials: "CO",
    color: "blue",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="section-pad section-white relative overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#e8900a] mb-3">Testimonials</span> */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031033] mb-4">
            Trusted by Businesses &amp;{" "}
            <span className="text-[#e8900a]">Developers</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => {
            const isOrange = t.color === "orange";
            return (
              <div
                key={t.id}
                id={`testimonial-${t.id}`}
                className="feature-card p-7 flex flex-col gap-5 relative group"
              >
                {/* Quote icon */}
                <div
                  className={`w-10 h-10 flex items-center justify-center ${isOrange ? "bg-[#fff8ee]" : "bg-[#f2f5fc]"}`}
                >
                  <Quote
                    className={`w-5 h-5 ${isOrange ? "text-[#e8900a]" : "text-[#031033]"}`}
                    strokeWidth={1.8}
                  />
                </div>

                <p className="text-[#5a6a85] text-sm leading-relaxed flex-1 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-[#dce4f7]">
                  <div
                    className={`w-10 h-10 flex items-center justify-center font-bold text-sm text-white ${isOrange ? "bg-[#e8900a]" : "bg-[#031033]"}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[#031033] font-semibold text-sm">
                      {t.name}
                    </p>
                    <p className="text-[#9ba8c0] text-xs">{t.title}</p>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-1 absolute top-7 right-7">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 fill-[#e8900a] text-[#e8900a]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
