"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Cpu,
  Globe2,
  HardDrive,
  Loader2,
  Lock,
  MapPin,
  MemoryStick,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import {
  setRecentVpsPurchase,
  useVpsImages,
  useVpsLocations,
  useVpsPlans,
  useGetSshKeys,
} from "@/hooks/useVps";
import { useInitializeCartPayment } from "@/hooks/useOrders";
import { SshKeyPicker } from "@/components/vps/SshKeyManager";
import {
  formatNaira,
  formatVpsDate,
  humanizeImage,
  locationLabel,
  nextBillingDate,
  validateVpsName,
} from "@/components/vps/vps-utils";

type Step = "plan" | "configure" | "review";

const STEP_NUMBER: Record<Step, number> = {
  plan: 1,
  configure: 2,
  review: 3,
};

const STEPS = [
  { number: 1, label: "Plan" },
  { number: 2, label: "Configure" },
  { number: 3, label: "Review & Pay" },
];

function StepperBar({ step }: { step: Step }) {
  const active = STEP_NUMBER[step];

  return (
    <div className="w-full bg-white rounded-[14px] border border-[#e8e8ed] px-4 sm:px-8 py-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((item, index) => {
          const completed = active > item.number;
          const current = active === item.number;

          return (
            <div
              key={item.number}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                    completed
                      ? "bg-emerald-600 text-white"
                      : current
                        ? "bg-[#1787D4] text-white"
                        : "bg-[#e5e7eb] text-[#6b7280]"
                  }`}
                >
                  {completed ? <Check className="w-3.5 h-3.5" /> : item.number}
                </div>
                <span
                  className={`text-[12.5px] whitespace-nowrap hidden sm:inline ${
                    current
                      ? "text-[#1787D4] font-semibold"
                      : completed
                        ? "text-[#1d1d1f] font-medium"
                        : "text-[#9ca3af] font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-3 ${
                    completed ? "bg-[#1787D4]" : "bg-[#e5e7eb]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function VpsPurchasePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#1787D4]" />
        </div>
      }
    >
      <VpsPurchaseContent />
    </Suspense>
  );
}

function VpsPurchaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const plansQuery = useVpsPlans();
  const imagesQuery = useVpsImages();
  const locationsQuery = useVpsLocations();
  const { data: sshKeys } = useGetSshKeys();
  const { mutate: initializePayment, isPending: paying, error: payError } =
    useInitializeCartPayment();

  const [step, setStep] = useState<Step>("plan");
  const [planId, setPlanId] = useState("");
  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [sshKeyId, setSshKeyId] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const images = useMemo(() => imagesQuery.data ?? [], [imagesQuery.data]);
  const locations = useMemo(
    () => locationsQuery.data ?? [],
    [locationsQuery.data],
  );

  // A plan linked from the marketing page is preselected once the catalogue
  // loads. The customer can still pick another plan.
  const requestedPlanId = searchParams.get("plan") ?? "";
  const preselectedPlanId = useMemo(
    () =>
      plans.some((plan) => plan.id === requestedPlanId)
        ? requestedPlanId
        : "",
    [plans, requestedPlanId],
  );

  // Derive a default selection so the first plan, image and location are
  // ready without writing state from an effect.
  const effectivePlanId = planId || preselectedPlanId || plans[0]?.id || "";
  const effectiveImage = image || images[0]?.providerImage || "";
  const effectiveLocation = location || locations[0]?.id || "";

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === effectivePlanId),
    [plans, effectivePlanId],
  );
  const selectedImage = useMemo(
    () => images.find((entry) => entry.providerImage === effectiveImage),
    [images, effectiveImage],
  );
  const selectedLocation = useMemo(
    () => locations.find((entry) => entry.id === effectiveLocation),
    [locations, effectiveLocation],
  );
  const selectedKey = useMemo(
    () => (sshKeys ?? []).find((key) => key.id === sshKeyId),
    [sshKeys, sshKeyId],
  );

  const renewalDate = nextBillingDate(30);

  const goConfigure = () => {
    if (!selectedPlan) {
      toast.error("Select a plan to continue.");
      return;
    }
    setStep("configure");
  };

  const goReview = () => {
    const nameValidation = validateVpsName(name);
    if (nameValidation) {
      setNameError(nameValidation);
      return;
    }
    if (!effectiveImage) {
      setConfigError("Select an operating system.");
      return;
    }
    if (!effectiveLocation) {
      setConfigError("Select a location for your server.");
      return;
    }
    if (!sshKeyId) {
      setConfigError(
        "Select or add an SSH key. We never store root passwords.",
      );
      return;
    }

    setConfigError(null);
    setNameError(null);
    setStep("review");
  };

  const pay = () => {
    if (!selectedPlan) return;

    initializePayment(
      [
        {
          type: "VPS",
          planId: selectedPlan.id,
          image: effectiveImage,
          location: effectiveLocation,
          name: name.trim(),
          sshKeyId,
        },
      ],
      {
        onSuccess: (res) => {
          if (!res?.data?.paymentUrl) {
            toast.error("No payment URL returned. Please try again.");
            return;
          }
          setRecentVpsPurchase({
            reference: res.data.reference,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            image: effectiveImage,
            location: effectiveLocation,
            name: name.trim(),
          });
          window.location.href = res.data.paymentUrl;
        },
      },
    );
  };

  const pageTitle =
    step === "plan"
      ? "Deploy a virtual server"
      : step === "configure"
        ? "Configure your server"
        : "Review and pay";

  const pageSubtitle =
    step === "plan"
      ? "Choose the resources you need. Every plan includes dedicated CPU, NVMe storage and full root access."
      : step === "configure"
        ? "Pick your operating system, region and SSH access before checkout."
        : "Check the details below. You will complete payment securely on Paystack.";

  const backAction = () => {
    if (step === "plan") router.push("/dashboard/vps");
    else if (step === "configure") setStep("plan");
    else setStep("configure");
  };

  const backLabel =
    step === "plan"
      ? "Back to VPS servers"
      : step === "configure"
        ? "Back to plans"
        : "Back to configuration";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      <div>
        <button
          type="button"
          onClick={backAction}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#1371B5] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </button>
        <h2
          className="text-[24px] font-bold"
          style={{
            color: "#1d1d1f",
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          {pageTitle}
        </h2>
        <p className="text-[14px] mt-0.5 text-[#6e6e73]">{pageSubtitle}</p>
      </div>

      <StepperBar step={step} />

      {/* ── Step 1: choose plan ─────────────────────────────────────────── */}
      {step === "plan" && (
        <div className="flex flex-col gap-5">
          {plansQuery.isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="bg-white rounded-[14px] border border-[#e8e8ed] p-6 animate-pulse min-h-[330px]"
                >
                  <div className="h-5 w-28 bg-[#eef1f5] rounded" />
                  <div className="h-9 w-36 bg-[#eef1f5] rounded mt-4" />
                  <div className="space-y-3 mt-8">
                    <div className="h-3.5 w-40 bg-[#eef1f5] rounded" />
                    <div className="h-3.5 w-32 bg-[#eef1f5] rounded" />
                    <div className="h-3.5 w-36 bg-[#eef1f5] rounded" />
                  </div>
                  <div className="h-10 w-full bg-[#eef1f5] rounded-lg mt-10" />
                </div>
              ))}
            </div>
          )}

          {plansQuery.isError && (
            <div className="bg-white rounded-[14px] border border-red-200 px-6 py-10 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
              <h3 className="text-[15px] font-bold text-[#1d1d1f] mt-2">
                Could not load VPS plans
              </h3>
              <p className="text-[12.5px] text-[#6e6e73] mt-1">
                Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => plansQuery.refetch()}
                className="mt-4 px-4 py-2 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!plansQuery.isLoading &&
            !plansQuery.isError &&
            plans.length === 0 && (
              <div className="bg-white rounded-[14px] border border-[#e8e8ed] px-6 py-12 text-center">
                <Server className="w-8 h-8 text-[#aeaeb2] mx-auto" />
                <h3 className="text-[15px] font-bold text-[#1d1d1f] mt-2">
                  No VPS plans available
                </h3>
                <p className="text-[12.5px] text-[#6e6e73] mt-1">
                  We are updating our plans. Please check back shortly or contact
                  support.
                </p>
                <Link
                  href="/dashboard/tickets"
                  className="inline-flex mt-4 text-[12.5px] font-semibold text-[#1787D4] hover:underline"
                >
                  Contact support
                </Link>
              </div>
            )}

          {!plansQuery.isLoading && plans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {plans.map((plan) => {
                const selected = plan.id === effectivePlanId;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setPlanId(plan.id)}
                    className={`text-left flex flex-col justify-between bg-white rounded-[14px] p-6 transition-all ${
                      selected
                        ? "border-2 border-[#1787D4] shadow-[0_4px_20px_rgba(23,135,212,0.10)]"
                        : "border border-[#e8e8ed] hover:border-[#c9d8e8] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[17px] font-bold text-[#1d1d1f]">
                          {plan.name}
                        </h3>
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            selected
                              ? "border-[#1787D4] bg-[#1787D4]"
                              : "border-[#c8c8cc]"
                          }`}
                        >
                          {selected && (
                            <Check
                              className="w-3 h-3 text-white"
                              strokeWidth={3}
                            />
                          )}
                        </span>
                      </div>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-[26px] font-bold text-[#1d1d1f] tracking-tight">
                          {formatNaira(plan.priceNgnMonthly)}
                        </span>
                        <span className="text-[12px] text-[#6e6e73]">
                          /month
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#8a9bb2] mt-0.5">
                        Prepaid for 30 days
                      </p>

                      <div className="mt-5 pt-4 border-t border-[#f0f0f3] space-y-2.5">
                        <div className="flex items-center gap-2.5 text-[12.5px] text-[#334155]">
                          <Cpu className="w-4 h-4 text-[#1787D4] shrink-0" />
                          <span>
                            <strong className="font-semibold">{plan.cpu}</strong>{" "}
                            vCPU
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[12.5px] text-[#334155]">
                          <MemoryStick className="w-4 h-4 text-[#1787D4] shrink-0" />
                          <span>
                            <strong className="font-semibold">
                              {plan.ramGb} GB
                            </strong>{" "}
                            RAM
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[12.5px] text-[#334155]">
                          <HardDrive className="w-4 h-4 text-[#1787D4] shrink-0" />
                          <span>
                            <strong className="font-semibold">
                              {plan.diskGb} GB
                            </strong>{" "}
                            NVMe SSD
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#f0f0f3] grid grid-cols-2 gap-y-2 gap-x-3">
                        {[
                          "Full root access",
                          "Dedicated IPv4",
                          "IPv6 included",
                          "Custom firewall",
                        ].map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center gap-1.5 text-[11.5px] text-[#5a6a85]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`mt-6 w-full py-2.5 rounded-lg text-[12.5px] font-semibold text-center transition-colors ${
                        selected
                          ? "bg-[#1787D4] text-white"
                          : "bg-[#f5f8fc] text-[#1d1d1f] border border-[#e2eaf3]"
                      }`}
                    >
                      {selected ? "Selected" : "Select plan"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11.5px] text-[#8a9bb2] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1787D4]" />
              Plans are billed every 30 days. Delete the server at any time to
              stop future billing.
            </p>
            <button
              type="button"
              onClick={goConfigure}
              disabled={!selectedPlan}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: configure ───────────────────────────────────────────── */}
      {step === "configure" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* OS */}
            <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-[#f0f0f3] flex items-center gap-2.5">
                <Terminal className="w-[18px] h-[18px] text-[#1787D4]" />
                <div>
                  <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
                    Operating system
                  </h3>
                  <p className="text-[11.5px] text-[#6e6e73]">
                    A fresh image is installed on your server.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {imagesQuery.isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className="h-14 rounded-lg bg-[#f5f5f7] animate-pulse"
                      />
                    ))}
                  </div>
                )}

                {imagesQuery.isError && (
                  <div className="text-center py-6">
                    <p className="text-[12.5px] text-[#6e6e73]">
                      Could not load operating systems.
                    </p>
                    <button
                      type="button"
                      onClick={() => imagesQuery.refetch()}
                      className="mt-2 text-[12px] font-semibold text-[#1787D4] hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!imagesQuery.isLoading && images.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {images.map((entry) => {
                      const selected = entry.providerImage === effectiveImage;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            setImage(entry.providerImage);
                            setConfigError(null);
                          }}
                          className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all ${
                            selected
                              ? "border-[#1787D4] bg-[#f6fbff] ring-2 ring-[#1787D4]/10"
                              : "border-[#e8e8ed] hover:border-[#c9d8e8]"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                              selected
                                ? "bg-[#1787D4] border-[#1787D4] text-white"
                                : "bg-[#f5f5f7] border-[#e8e8ed] text-[#6e6e73]"
                            }`}
                          >
                            <Terminal className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-semibold text-[#1d1d1f] truncate">
                              {entry.label}
                            </p>
                            <p className="text-[10.5px] font-mono text-[#8a9bb2] truncate">
                              {entry.providerImage}
                            </p>
                          </div>
                          {selected && (
                            <Check className="w-4 h-4 text-[#1787D4] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!imagesQuery.isLoading &&
                  !imagesQuery.isError &&
                  images.length === 0 && (
                    <p className="text-[12.5px] text-[#6e6e73] text-center py-4">
                      No operating systems are available right now.
                    </p>
                  )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-[#f0f0f3] flex items-center gap-2.5">
                <MapPin className="w-[18px] h-[18px] text-[#1787D4]" />
                <div>
                  <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
                    Location
                  </h3>
                  <p className="text-[11.5px] text-[#6e6e73]">
                    Pick the region closest to your users.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {locationsQuery.isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="h-20 rounded-lg bg-[#f5f5f7] animate-pulse"
                      />
                    ))}
                  </div>
                )}
                {!locationsQuery.isLoading && locations.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {locations.map((entry) => {
                      const selected = entry.id === effectiveLocation;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            setLocation(entry.id);
                            setConfigError(null);
                          }}
                          className={`rounded-lg border px-3.5 py-3 text-left transition-all ${
                            selected
                              ? "border-[#1787D4] bg-[#f6fbff] ring-2 ring-[#1787D4]/10"
                              : "border-[#e8e8ed] hover:border-[#c9d8e8]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12.5px] font-semibold text-[#1d1d1f]">
                              {entry.name}
                            </span>
                            <span className="text-[10px] font-bold text-[#6e6e73] bg-white border border-[#e8e8ed] px-1.5 py-0.5 rounded">
                              {entry.countryCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6e6e73] mt-0.5">
                            {entry.country}
                          </p>
                          <p className="text-[10px] font-mono text-[#8a9bb2] mt-1">
                            {entry.id}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-[#f0f0f3] flex items-center gap-2.5">
                <Server className="w-[18px] h-[18px] text-[#1787D4]" />
                <div>
                  <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
                    Server name
                  </h3>
                  <p className="text-[11.5px] text-[#6e6e73]">
                    A label to help you identify this server.
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <label className="text-[11.5px] font-semibold text-[#1d1d1f] block mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(null);
                  }}
                  maxLength={40}
                  placeholder="e.g. api-server"
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-[13px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none transition-colors ${
                    nameError
                      ? "border-red-300 focus:border-red-400"
                      : "border-[#e8e8ed] focus:border-[#1787D4]"
                  }`}
                />
                {nameError ? (
                  <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {nameError}
                  </p>
                ) : (
                  <p className="text-[10.5px] text-[#8a9bb2] mt-1.5">
                    3–40 characters. Letters, numbers, spaces, dots, hyphens and
                    underscores.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Summary + SSH */}
          <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-4">
            <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 sm:p-6">
              <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                Order summary
              </h3>

              <div className="mt-3.5 flex items-start gap-3 pb-3.5 border-b border-[#f0f0f3]">
                <div className="w-9 h-9 rounded-lg bg-[#eff6fc] border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-[#1d1d1f]">
                    {selectedPlan?.name ?? "VPS"} server
                  </p>
                  <p className="text-[11px] text-[#6e6e73] truncate">
                    {humanizeImage(effectiveImage)} ·{" "}
                    {locationLabel(effectiveLocation)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 text-[12.5px]">
                <span className="text-[#6e6e73]">Monthly price</span>
                <span className="font-bold text-[#1d1d1f]">
                  {formatNaira(selectedPlan?.priceNgnMonthly ?? 0)}
                </span>
              </div>

              <div className="rounded-lg bg-[#f8fafc] border border-[#eef2f8] px-3 py-2.5 text-[11px] text-[#5a6a85] leading-relaxed">
                Your server is prepaid for 30 days, until{" "}
                <strong className="text-[#1d1d1f]">
                  {formatVpsDate(renewalDate.toISOString())}
                </strong>
                . You can renew from your dashboard before then.
              </div>

              <button
                type="button"
                onClick={goReview}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold transition-colors"
              >
                Continue to review
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-[#1787D4]" />
                <h3 className="text-[14px] font-bold text-[#1d1d1f]">
                  SSH access
                </h3>
              </div>
              <SshKeyPicker selectedId={sshKeyId} onSelect={setSshKeyId} />
            </div>

            {configError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{configError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: review + pay ────────────────────────────────────────── */}
      {step === "review" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#f0f0f3]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#eff6fc] border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
                      {name.trim()}
                    </h3>
                    <p className="text-[11.5px] text-[#6e6e73]">
                      {selectedPlan?.name} ·{" "}
                      {humanizeImage(selectedImage?.label ?? effectiveImage)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("configure")}
                  className="text-[12px] font-semibold text-[#1787D4] hover:underline shrink-0"
                >
                  Edit
                </button>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
                    Plan
                  </span>
                  <span className="text-[12.5px] font-semibold text-[#1d1d1f] block mt-0.5">
                    {selectedPlan?.name}
                  </span>
                  <span className="text-[10.5px] text-[#6e6e73]">
                    {selectedPlan?.cpu} vCPU · {selectedPlan?.ramGb} GB
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
                    Disk
                  </span>
                  <span className="text-[12.5px] font-semibold text-[#1d1d1f] block mt-0.5">
                    {selectedPlan?.diskGb} GB
                  </span>
                  <span className="text-[10.5px] text-[#6e6e73]">NVMe SSD</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
                    Location
                  </span>
                  <span className="text-[12.5px] font-semibold text-[#1d1d1f] block mt-0.5">
                    {selectedLocation?.name ?? locationLabel(effectiveLocation)}
                  </span>
                  <span className="text-[10.5px] text-[#6e6e73]">
                    {selectedLocation?.country ?? ""}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
                    SSH key
                  </span>
                  <span className="text-[12.5px] font-semibold text-[#1d1d1f] block mt-0.5 truncate">
                    {selectedKey?.name ?? "Selected key"}
                  </span>
                  <span className="text-[10.5px] text-emerald-700">
                    Password login disabled
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 sm:p-6">
              <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
                What happens next
              </h3>
              <div className="mt-4 flex flex-col gap-3.5">
                {[
                  {
                    title: "Payment confirmed",
                    body: "Paystack securely confirms your payment.",
                  },
                  {
                    title: "Server provisioned",
                    body: "We create the server and attach your SSH key and firewall.",
                  },
                  {
                    title: "IP address ready",
                    body: "Your public IP appears on the VPS dashboard, usually within a minute.",
                  },
                ].map((item, index) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#eff6fc] border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center text-[11px] font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-[12.5px] font-semibold text-[#1d1d1f]">
                        {item.title}
                      </p>
                      <p className="text-[11.5px] text-[#6e6e73] mt-0.5">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-4">
            <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 sm:p-6">
              <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                Payment summary
              </h3>

              <div className="mt-4 space-y-2.5 text-[13px]">
                <div className="flex items-start justify-between gap-3 text-[#6e6e73]">
                  <span>
                    {selectedPlan?.name} VPS · 30 days
                    <span className="block text-[10.5px] text-[#8a9bb2] mt-0.5">
                      Renews by {formatVpsDate(renewalDate.toISOString())}
                    </span>
                  </span>
                  <span className="font-semibold text-[#1d1d1f] shrink-0">
                    {formatNaira(selectedPlan?.priceNgnMonthly ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#6e6e73]">
                  <span>Setup fee</span>
                  <span className="text-emerald-700 font-medium">Free</span>
                </div>
                <div className="border-t border-[#e8e8ed] pt-3 flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#1d1d1f]">
                    Total due today
                  </span>
                  <span className="text-[18px] font-bold text-[#1787D4]">
                    {formatNaira(selectedPlan?.priceNgnMonthly ?? 0)}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#e8e8ed] bg-[#f8fafc] p-3 flex items-center gap-3">
                <Image
                  src="/paystack-logo.png"
                  alt="Paystack"
                  width={90}
                  height={24}
                  className="h-6 w-auto object-contain shrink-0"
                />
                <p className="text-[10.5px] text-[#6e6e73] leading-snug">
                  Pay with card, bank transfer, USSD or Apple Pay. Card details
                  are never stored on Nupat servers.
                </p>
              </div>

              <button
                type="button"
                onClick={pay}
                disabled={paying}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting to Paystack…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatNaira(selectedPlan?.priceNgnMonthly ?? 0)} securely
                  </>
                )}
              </button>

              <p className="text-[10px] text-[#8a9bb2] text-center mt-2 leading-relaxed">
                Prepaid for 30 days. No automatic card charges. Renew manually
                from your dashboard.
              </p>

              {payError instanceof Error && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] text-red-700">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{payError.message}</span>
                </div>
              )}
            </div>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3 text-[11px] text-[#475569] flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1787D4] shrink-0 mt-0.5" />
              <span>
                If we cannot provision your server after payment, we start a
                refund to your original payment method. Paystack processes it;
                banks can take up to 10 business days to settle.
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="text-[10.5px] text-[#8a9bb2] flex items-center gap-1.5">
        <Globe2 className="w-3.5 h-3.5" />
        All servers are deployed on Hetzner Cloud infrastructure in the selected
        region.
      </div>
    </div>
  );
}
