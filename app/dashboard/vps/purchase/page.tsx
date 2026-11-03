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
  MemoryStick,
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
  { number: 3, label: "Review & pay" },
];

function StepperBar({ step }: { step: Step }) {
  const active = STEP_NUMBER[step];

  return (
    <div className="w-full bg-white rounded-xl border border-[#E2E8F0] px-5 py-4">
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
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium tabular-nums shrink-0 ${
                    completed
                      ? "bg-[#0E7C3A] text-white"
                      : current
                        ? "bg-[#1787D4] text-white"
                        : "bg-[#EEF2F7] text-[#5A6A85]"
                  }`}
                >
                  {completed ? <Check className="w-3.5 h-3.5" /> : item.number}
                </div>
                <span
                  className={`text-sm whitespace-nowrap hidden sm:inline ${
                    current
                      ? "text-[#031033] font-medium"
                      : completed
                        ? "text-[#031033] font-medium"
                        : "text-[#5A6A85] font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-3 ${
                    completed ? "bg-[#1787D4]" : "bg-[#EEF2F7]"
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
        <div className="flex flex-col gap-6 max-w-6xl mx-auto" aria-label="Loading">
          <div className="h-8 w-64 rounded bg-[#EEF2F7] animate-pulse" />
          <div className="h-14 rounded-xl bg-[#EEF2F7] animate-pulse" />
          <div className="h-80 rounded-xl bg-[#EEF2F7] animate-pulse" />
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
          className="inline-flex items-center gap-1.5 mb-3 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </button>
        <h1 className="text-2xl font-semibold text-[#031033]">{pageTitle}</h1>
        <p className="text-sm mt-1 text-[#5A6A85]">{pageSubtitle}</p>
      </div>

      <StepperBar step={step} />

      {/* ── Step 1: choose plan ─────────────────────────────────────────── */}
      {step === "plan" && (
        <div className="flex flex-col gap-6">
          {plansQuery.isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-6 min-h-[330px]"
                >
                  <div className="h-5 w-28 bg-[#EEF2F7] rounded animate-pulse" />
                  <div className="h-8 w-36 bg-[#EEF2F7] rounded mt-4 animate-pulse" />
                  <div className="space-y-3 mt-8">
                    <div className="h-3.5 w-40 bg-[#EEF2F7] rounded animate-pulse" />
                    <div className="h-3.5 w-32 bg-[#EEF2F7] rounded animate-pulse" />
                    <div className="h-3.5 w-36 bg-[#EEF2F7] rounded animate-pulse" />
                  </div>
                  <div className="h-9 w-full bg-[#EEF2F7] rounded-lg mt-10 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {plansQuery.isError && (
            <div className="bg-white rounded-xl border border-[#DC2626]/20 px-6 py-10 text-center">
              <AlertCircle className="w-5 h-5 text-[#DC2626] mx-auto" />
              <h3 className="text-base font-semibold text-[#031033] mt-2">
                Could not load VPS plans
              </h3>
              <p className="text-sm text-[#5A6A85] mt-1">
                Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => plansQuery.refetch()}
                className="mt-4 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Retry
              </button>
            </div>
          )}

          {!plansQuery.isLoading &&
            !plansQuery.isError &&
            plans.length === 0 && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] px-6 py-12 text-center">
                <h3 className="text-base font-semibold text-[#031033]">
                  No VPS plans available
                </h3>
                <p className="text-sm text-[#5A6A85] mt-1">
                  We are updating our plans. Please check back shortly or contact
                  support.
                </p>
                <Link
                  href="/dashboard/tickets"
                  className="inline-flex mt-4 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Contact support
                </Link>
              </div>
            )}

          {!plansQuery.isLoading && plans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {plans.map((plan) => {
                const selected = plan.id === effectivePlanId;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setPlanId(plan.id)}
                    aria-pressed={selected}
                    className={`text-left flex flex-col justify-between bg-white rounded-xl border p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                      selected
                        ? "border-[#1787D4] ring-2 ring-[#1787D4]/15"
                        : "border-[#E2E8F0] hover:border-[#D5DCE6]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-[#031033]">
                          {plan.name}
                        </h3>
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            selected
                              ? "border-[#1787D4] bg-[#1787D4]"
                              : "border-[#D5DCE6]"
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
                        <span className="text-2xl font-semibold text-[#031033] tabular-nums">
                          {formatNaira(plan.priceNgnMonthly)}
                        </span>
                        <span className="text-xs text-[#5A6A85]">
                          /month
                        </span>
                      </div>
                      <p className="text-xs text-[#5A6A85] mt-0.5">
                        Prepaid for 30 days
                      </p>

                      <div className="mt-5 pt-4 border-t border-[#EEF2F7] space-y-2.5">
                        <div className="flex items-center gap-2.5 text-sm text-[#031033]">
                          <Cpu className="w-4 h-4 text-[#5A6A85] shrink-0" />
                          <span>
                            <strong className="font-semibold tabular-nums">{plan.cpu}</strong>{" "}
                            vCPU
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-[#031033]">
                          <MemoryStick className="w-4 h-4 text-[#5A6A85] shrink-0" />
                          <span>
                            <strong className="font-semibold tabular-nums">
                              {plan.ramGb} GB
                            </strong>{" "}
                            RAM
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-[#031033]">
                          <HardDrive className="w-4 h-4 text-[#5A6A85] shrink-0" />
                          <span>
                            <strong className="font-semibold tabular-nums">
                              {plan.diskGb} GB
                            </strong>{" "}
                            NVMe SSD
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#EEF2F7] grid grid-cols-2 gap-y-2 gap-x-3">
                        {[
                          "Full root access",
                          "Dedicated IPv4",
                          "IPv6 included",
                          "Custom firewall",
                        ].map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center gap-1.5 text-xs text-[#5A6A85]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7C3A] shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`mt-6 w-full h-9 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        selected
                          ? "bg-[#E8F4FC] text-[#1370B5]"
                          : "bg-white text-[#031033] border border-[#D5DCE6]"
                      }`}
                    >
                      {selected ? "Selected" : "Select plan"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#5A6A85] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A6A85] shrink-0" />
              Plans are billed every 30 days. Delete the server at any time to
              stop future billing.
            </p>
            <button
              type="button"
              onClick={goConfigure}
              disabled={!selectedPlan}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* OS */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EEF2F7]">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Operating system
                  </h3>
                  <p className="text-xs text-[#5A6A85] mt-0.5">
                    A fresh image is installed on your server.
                  </p>
                </div>
              </div>

              <div className="p-5">
                {imagesQuery.isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className="h-16 rounded-lg bg-[#EEF2F7] animate-pulse"
                      />
                    ))}
                  </div>
                )}

                {imagesQuery.isError && (
                  <div className="text-center py-6">
                    <p className="text-sm text-[#5A6A85]">
                      Could not load operating systems.
                    </p>
                    <button
                      type="button"
                      onClick={() => imagesQuery.refetch()}
                      className="mt-2 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
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
                          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                            selected
                              ? "border-[#1787D4] bg-[#E8F4FC] ring-2 ring-[#1787D4]/15"
                              : "border-[#E2E8F0] hover:border-[#D5DCE6]"
                          }`}
                        >
                          <Terminal
                            className={`w-4 h-4 shrink-0 ${
                              selected ? "text-[#1787D4]" : "text-[#5A6A85]"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[#031033] truncate">
                              {entry.label}
                            </p>
                            <p className="text-xs font-mono text-[#5A6A85] truncate">
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
                    <p className="text-sm text-[#5A6A85] text-center py-4">
                      No operating systems are available right now.
                    </p>
                  )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EEF2F7]">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Location
                  </h3>
                  <p className="text-xs text-[#5A6A85] mt-0.5">
                    Pick the region closest to your users.
                  </p>
                </div>
              </div>

              <div className="p-5">
                {locationsQuery.isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="h-20 rounded-lg bg-[#EEF2F7] animate-pulse"
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
                          className={`rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                            selected
                              ? "border-[#1787D4] bg-[#E8F4FC] ring-2 ring-[#1787D4]/15"
                              : "border-[#E2E8F0] hover:border-[#D5DCE6]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-[#031033]">
                              {entry.name}
                            </span>
                            <span className="whitespace-nowrap text-xs font-medium text-[#5A6A85]">
                              {entry.countryCode}
                            </span>
                          </div>
                          <p className="text-xs text-[#5A6A85] mt-0.5">
                            {entry.country}
                          </p>
                          <p className="text-xs font-mono text-[#5A6A85] mt-1">
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
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EEF2F7]">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Server name
                  </h3>
                  <p className="text-xs text-[#5A6A85] mt-0.5">
                    A label to help you identify this server.
                  </p>
                </div>
              </div>
              <div className="p-5">
                <label htmlFor="vps-purchase-name" className="text-sm font-medium text-[#031033] block mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  id="vps-purchase-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(null);
                  }}
                  maxLength={40}
                  placeholder="e.g. api-server"
                  className={`w-full h-10 rounded-lg border bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:ring-2 transition-colors ${
                    nameError
                      ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/15"
                      : "border-[#D5DCE6] focus:border-[#1787D4] focus:ring-[#1787D4]/15"
                  }`}
                />
                {nameError ? (
                  <p className="text-xs text-[#C21F1F] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {nameError}
                  </p>
                ) : (
                  <p className="text-xs text-[#5A6A85] mt-1.5">
                    3–40 characters. Letters, numbers, spaces, dots, hyphens and
                    underscores.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Summary + SSH */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h3 className="text-base font-semibold text-[#031033]">
                Order summary
              </h3>

              <div className="mt-4 pb-4 border-b border-[#EEF2F7]">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#031033]">
                    {selectedPlan?.name ?? "VPS"} server
                  </p>
                  <p className="text-xs text-[#5A6A85] truncate">
                    {humanizeImage(effectiveImage)} ·{" "}
                    {locationLabel(effectiveLocation)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-[#5A6A85]">Monthly price</span>
                <span className="font-semibold text-[#031033] tabular-nums">
                  {formatNaira(selectedPlan?.priceNgnMonthly ?? 0)}
                </span>
              </div>

              <div className="rounded-lg bg-[#F2F5FC] px-4 py-3 text-xs text-[#5A6A85] leading-relaxed">
                Your server is prepaid for 30 days, until{" "}
                <strong className="font-medium text-[#031033] tabular-nums">
                  {formatVpsDate(renewalDate.toISOString())}
                </strong>
                . You can renew from your dashboard before then.
              </div>

              <button
                type="button"
                onClick={goReview}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to review
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h3 className="text-base font-semibold text-[#031033] mb-3">
                SSH access
              </h3>
              <SshKeyPicker selectedId={sshKeyId} onSelect={setSshKeyId} />
            </div>

            {configError && (
              <div className="flex items-start gap-2 rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 text-sm text-[#C21F1F]">
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
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#EEF2F7]">
                <div className="flex items-center gap-2.5">
                  <div>
                    <h3 className="text-base font-semibold text-[#031033]">
                      {name.trim()}
                    </h3>
                    <p className="text-xs text-[#5A6A85]">
                      {selectedPlan?.name} ·{" "}
                      {humanizeImage(selectedImage?.label ?? effectiveImage)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("configure")}
                  className="rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0"
                >
                  Edit
                </button>
              </div>

              <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Plan
                  </span>
                  <span className="text-sm font-medium text-[#031033] block mt-0.5">
                    {selectedPlan?.name}
                  </span>
                  <span className="text-xs text-[#5A6A85]">
                    {selectedPlan?.cpu} vCPU · {selectedPlan?.ramGb} GB
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Disk
                  </span>
                  <span className="text-sm font-medium text-[#031033] block mt-0.5">
                    {selectedPlan?.diskGb} GB
                  </span>
                  <span className="text-xs text-[#5A6A85]">NVMe SSD</span>
                </div>
                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Location
                  </span>
                  <span className="text-sm font-medium text-[#031033] block mt-0.5">
                    {selectedLocation?.name ?? locationLabel(effectiveLocation)}
                  </span>
                  <span className="text-xs text-[#5A6A85]">
                    {selectedLocation?.country ?? ""}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    SSH key
                  </span>
                  <span className="text-sm font-medium text-[#031033] block mt-0.5 truncate">
                    {selectedKey?.name ?? "Selected key"}
                  </span>
                  <span className="text-xs text-[#0E7C3A]">
                    Password login disabled
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h3 className="text-base font-semibold text-[#031033]">
                What happens next
              </h3>
              <div className="mt-4 flex flex-col gap-4">
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
                    <div className="w-6 h-6 rounded-full border border-[#E2E8F0] text-[#5A6A85] flex items-center justify-center text-xs font-medium tabular-nums shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#031033]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#5A6A85] mt-0.5">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h3 className="text-base font-semibold text-[#031033]">
                Payment summary
              </h3>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-start justify-between gap-3 text-[#5A6A85]">
                  <span>
                    {selectedPlan?.name} VPS · 30 days
                    <span className="block text-xs text-[#5A6A85] mt-0.5">
                      Renews by{" "}
                      <span className="tabular-nums">
                        {formatVpsDate(renewalDate.toISOString())}
                      </span>
                    </span>
                  </span>
                  <span className="font-medium text-[#031033] tabular-nums shrink-0">
                    {formatNaira(selectedPlan?.priceNgnMonthly ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#5A6A85]">
                  <span>Setup fee</span>
                  <span className="text-[#0E7C3A] font-medium">Free</span>
                </div>
                <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#031033]">
                    Total due today
                  </span>
                  <span className="text-2xl font-semibold text-[#031033] tabular-nums">
                    {formatNaira(selectedPlan?.priceNgnMonthly ?? 0)}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-[#F2F5FC] px-4 py-3 flex items-center gap-3">
                <Image
                  src="/paystack-logo.png"
                  alt="Paystack"
                  width={90}
                  height={24}
                  className="h-6 w-[90px] object-contain object-left shrink-0"
                />
                <p className="text-xs text-[#5A6A85] leading-snug">
                  Pay with card, bank transfer, USSD or Apple Pay. Card details
                  are never stored on Nupat servers.
                </p>
              </div>

              <button
                type="button"
                onClick={pay}
                disabled={paying}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed tabular-nums"
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

              <p className="text-xs text-[#5A6A85] text-center mt-3 leading-relaxed">
                Prepaid for 30 days. No automatic card charges. Renew manually
                from your dashboard.
              </p>

              {payError instanceof Error && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 text-sm text-[#C21F1F]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{payError.message}</span>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-xs text-[#5A6A85] leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A6A85] shrink-0 mt-0.5" />
              <span>
                If we cannot provision your server after payment, we start a
                refund to your original payment method. Paystack processes it, and
                banks can take up to 10 business days to settle.
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-[#5A6A85] flex items-center gap-1.5">
        <Globe2 className="w-3.5 h-3.5 shrink-0" />
        All servers are deployed on Hetzner Cloud infrastructure in the selected
        region.
      </div>
    </div>
  );
}
