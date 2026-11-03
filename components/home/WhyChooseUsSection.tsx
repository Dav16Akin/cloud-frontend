import React from "react";
import Image from "next/image";

const features = [
  {
    title: "A guided transfer",
    description: "We walk you through each step of moving your domain.",
  },
  {
    title: "Domains in one dashboard",
    description: "Manage your domains, DNS settings and renewals from one place.",
  },
  {
    title: "Reliable infrastructure",
    description:
      "Keep your domain connected to dependable hosting and DNS.",
  },
  {
    title: "Secure domain management",
    description:
      "Built with security in mind to help keep your domain protected.",
  },
  {
    title: "Quick to finish",
    description:
      "Complete the transfer without unnecessary steps.",
  },
];

/* Yellow check box from the original design */
function CheckIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      className="shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <rect width="22" height="22" rx="5" fill="#FFC75D" />
      <path
        d="M6 11.5L9.5 15L16 8"
        stroke="#031033"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
        <div className="w-full lg:w-[46%] shrink-0 flex justify-center lg:justify-start">
          <Image
            src="/whyus.png"
            alt="Customer wearing headphones giving a thumbs up"
            width={480}
            height={480}
            sizes="(max-width: 1024px) 420px, 46vw"
            className="w-full max-w-105 lg:max-w-none h-auto object-contain"
          />
        </div>

        <div className="flex-1 w-full">
          <h2 className="type-h2 text-[#031033] mb-3 text-center lg:text-left">
            Why transfer your domain to Nupat
          </h2>
          <p className="type-lead text-[#5A6A85] mb-8 text-center lg:text-left">
            What you get when you move your domain to us.
          </p>

          <ul className="flex flex-col gap-5">
            {features.map((feat) => (
              <li key={feat.title} className="flex items-start gap-3.5">
                <CheckIcon />
                <div>
                  <h3 className="text-lg font-semibold text-[#031033] leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-base text-[#5A6A85] leading-relaxed mt-1">
                    {feat.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
