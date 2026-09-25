"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Globe,
  Check,
  Sparkles,
  ArrowRight,
  Layers,
} from "lucide-react";
import { useGetSslCertificates, useGetSslProducts } from "@/hooks/useSsl";
import type { SslProduct, SslProductPrice } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface SslItem {
  id: string;
  certificate: string;
  domain: string;
  status: "Active" | "Expiring Soon" | "Expired" | "Pending";
  expires: string;
}

const FALLBACK_SSL_PRODUCTS: SslProduct[] = [
  {
    id: 58,
    name: "Code Signing",
    category: "organization_validation",
    validationMethod: "organization",
    deliveryTime: "1-3 days",
    isWildcard: false,
    maxPeriod: 3,
    price: 129000,
    currency: "NGN",
    wholesalePrice: 89.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 129000, currency: "NGN", wholesalePrice: 89.99, wholesaleCurrency: "USD" },
      { period: 2, price: 221000, currency: "NGN", wholesalePrice: 154.99, wholesaleCurrency: "USD" },
      { period: 3, price: 317000, currency: "NGN", wholesalePrice: 222.99, wholesaleCurrency: "USD" },
      { period: 4, price: 411000, currency: "NGN", wholesalePrice: 289.99, wholesaleCurrency: "USD" },
      { period: 5, price: 504000, currency: "NGN", wholesalePrice: 355.99, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 59,
    name: "Code Signing EV",
    category: "extended_validation",
    validationMethod: "extended",
    deliveryTime: "1-5 days",
    isWildcard: false,
    maxPeriod: 3,
    price: 565000,
    currency: "NGN",
    wholesalePrice: 399,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 565000, currency: "NGN", wholesalePrice: 399, wholesaleCurrency: "USD" },
      { period: 2, price: 987000, currency: "NGN", wholesalePrice: 697.99, wholesaleCurrency: "USD" },
      { period: 3, price: 1408000, currency: "NGN", wholesalePrice: 996.99, wholesaleCurrency: "USD" },
      { period: 4, price: 1830000, currency: "NGN", wholesalePrice: 1295.99, wholesaleCurrency: "USD" },
      { period: 5, price: 2253000, currency: "NGN", wholesalePrice: 1596, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 31,
    name: "EssentialSSL",
    category: "domain_validation",
    validationMethod: "domain",
    deliveryTime: "10m",
    isWildcard: false,
    maxPeriod: 5,
    price: 15000,
    currency: "NGN",
    wholesalePrice: 8.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 15000, currency: "NGN", wholesalePrice: 8.99, wholesaleCurrency: "USD" },
      { period: 2, price: 25000, currency: "NGN", wholesalePrice: 15.73, wholesaleCurrency: "USD" },
      { period: 3, price: 19000, currency: "NGN", wholesalePrice: 11.95, wholesaleCurrency: "USD" },
      { period: 4, price: 44000, currency: "NGN", wholesalePrice: 29.22, wholesaleCurrency: "USD" },
      { period: 5, price: 53000, currency: "NGN", wholesalePrice: 35.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 32,
    name: "EssentialSSL Wildcard",
    category: "wildcard",
    validationMethod: "domain",
    deliveryTime: "10m",
    isWildcard: true,
    maxPeriod: 5,
    price: 115000,
    currency: "NGN",
    wholesalePrice: 79.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 115000, currency: "NGN", wholesalePrice: 79.99, wholesaleCurrency: "USD" },
      { period: 2, price: 200000, currency: "NGN", wholesalePrice: 139.98, wholesaleCurrency: "USD" },
      { period: 3, price: 170000, currency: "NGN", wholesalePrice: 119, wholesaleCurrency: "USD" },
      { period: 4, price: 369000, currency: "NGN", wholesalePrice: 259.97, wholesaleCurrency: "USD" },
      { period: 5, price: 454000, currency: "NGN", wholesalePrice: 319.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 24,
    name: "EV SSL",
    category: "extended_validation",
    validationMethod: "extended",
    deliveryTime: "within 1 day",
    isWildcard: false,
    maxPeriod: 5,
    price: 129000,
    currency: "NGN",
    wholesalePrice: 89.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 129000, currency: "NGN", wholesalePrice: 89.99, wholesaleCurrency: "USD" },
      { period: 2, price: 225000, currency: "NGN", wholesalePrice: 157.48, wholesaleCurrency: "USD" },
      { period: 3, price: 320000, currency: "NGN", wholesalePrice: 224.98, wholesaleCurrency: "USD" },
      { period: 4, price: 415000, currency: "NGN", wholesalePrice: 292.47, wholesaleCurrency: "USD" },
      { period: 5, price: 510000, currency: "NGN", wholesalePrice: 359.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 33,
    name: "EVSSL multi-domain",
    category: "multi_domain",
    validationMethod: "extended",
    deliveryTime: "within 1 day",
    isWildcard: false,
    maxPeriod: 5,
    price: 284000,
    currency: "NGN",
    wholesalePrice: 199.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 284000, currency: "NGN", wholesalePrice: 199.99, wholesaleCurrency: "USD" },
      { period: 2, price: 496000, currency: "NGN", wholesalePrice: 349.98, wholesaleCurrency: "USD" },
      { period: 3, price: 707000, currency: "NGN", wholesalePrice: 499.98, wholesaleCurrency: "USD" },
      { period: 4, price: 919000, currency: "NGN", wholesalePrice: 649.97, wholesaleCurrency: "USD" },
      { period: 5, price: 1130000, currency: "NGN", wholesalePrice: 799.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 20,
    name: "InstantSSL",
    category: "organization_validation",
    validationMethod: "organization",
    deliveryTime: "up to 2 days",
    isWildcard: false,
    maxPeriod: 5,
    price: 52000,
    currency: "NGN",
    wholesalePrice: 34.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 52000, currency: "NGN", wholesalePrice: 34.99, wholesaleCurrency: "USD" },
      { period: 2, price: 89000, currency: "NGN", wholesalePrice: 61.23, wholesaleCurrency: "USD" },
      { period: 3, price: 52000, currency: "NGN", wholesalePrice: 34.99, wholesaleCurrency: "USD" },
      { period: 4, price: 163000, currency: "NGN", wholesalePrice: 113.72, wholesaleCurrency: "USD" },
      { period: 5, price: 200000, currency: "NGN", wholesalePrice: 139.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 21,
    name: "InstantSSL Pro",
    category: "organization_validation",
    validationMethod: "organization",
    deliveryTime: "up to 2 days",
    isWildcard: false,
    maxPeriod: 5,
    price: 59000,
    currency: "NGN",
    wholesalePrice: 39.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 59000, currency: "NGN", wholesalePrice: 39.99, wholesaleCurrency: "USD" },
      { period: 2, price: 101000, currency: "NGN", wholesalePrice: 69.98, wholesaleCurrency: "USD" },
      { period: 3, price: 143000, currency: "NGN", wholesalePrice: 99.98, wholesaleCurrency: "USD" },
      { period: 4, price: 186000, currency: "NGN", wholesalePrice: 129.97, wholesaleCurrency: "USD" },
      { period: 5, price: 228000, currency: "NGN", wholesalePrice: 159.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 41,
    name: "Positive SSL",
    category: "domain_validation",
    validationMethod: "domain",
    deliveryTime: "10m",
    isWildcard: false,
    maxPeriod: 5,
    price: 15000,
    currency: "NGN",
    wholesalePrice: 8.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 15000, currency: "NGN", wholesalePrice: 8.99, wholesaleCurrency: "USD" },
      { period: 2, price: 25000, currency: "NGN", wholesalePrice: 15.73, wholesaleCurrency: "USD" },
      { period: 3, price: 19000, currency: "NGN", wholesalePrice: 11.95, wholesaleCurrency: "USD" },
      { period: 4, price: 44000, currency: "NGN", wholesalePrice: 29.22, wholesaleCurrency: "USD" },
      { period: 5, price: 53000, currency: "NGN", wholesalePrice: 35.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 40,
    name: "Positive SSL multi-domain",
    category: "multi_domain",
    validationMethod: "domain",
    deliveryTime: "10m",
    isWildcard: false,
    maxPeriod: 5,
    price: 31000,
    currency: "NGN",
    wholesalePrice: 19.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 31000, currency: "NGN", wholesalePrice: 19.99, wholesaleCurrency: "USD" },
      { period: 2, price: 52000, currency: "NGN", wholesalePrice: 34.98, wholesaleCurrency: "USD" },
      { period: 3, price: 73000, currency: "NGN", wholesalePrice: 49.98, wholesaleCurrency: "USD" },
      { period: 4, price: 94000, currency: "NGN", wholesalePrice: 64.97, wholesaleCurrency: "USD" },
      { period: 5, price: 115000, currency: "NGN", wholesalePrice: 79.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 42,
    name: "Positive SSL Wildcard",
    category: "wildcard",
    validationMethod: "domain",
    deliveryTime: "10m",
    isWildcard: true,
    maxPeriod: 5,
    price: 115000,
    currency: "NGN",
    wholesalePrice: 79.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 115000, currency: "NGN", wholesalePrice: 79.99, wholesaleCurrency: "USD" },
      { period: 2, price: 200000, currency: "NGN", wholesalePrice: 139.98, wholesaleCurrency: "USD" },
      { period: 3, price: 170000, currency: "NGN", wholesalePrice: 119, wholesaleCurrency: "USD" },
      { period: 4, price: 369000, currency: "NGN", wholesalePrice: 259.97, wholesaleCurrency: "USD" },
      { period: 5, price: 454000, currency: "NGN", wholesalePrice: 319.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 22,
    name: "PremiumSSL",
    category: "organization_validation",
    validationMethod: "organization",
    deliveryTime: "up to 2 days",
    isWildcard: false,
    maxPeriod: 5,
    price: 73000,
    currency: "NGN",
    wholesalePrice: 49.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 73000, currency: "NGN", wholesalePrice: 49.99, wholesaleCurrency: "USD" },
      { period: 2, price: 126000, currency: "NGN", wholesalePrice: 87.48, wholesaleCurrency: "USD" },
      { period: 3, price: 179000, currency: "NGN", wholesalePrice: 124.98, wholesaleCurrency: "USD" },
      { period: 4, price: 232000, currency: "NGN", wholesalePrice: 162.47, wholesaleCurrency: "USD" },
      { period: 5, price: 284000, currency: "NGN", wholesalePrice: 199.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 23,
    name: "PremiumSSL Wildcard",
    category: "wildcard",
    validationMethod: "organization",
    deliveryTime: "up to 2 days",
    isWildcard: true,
    maxPeriod: 5,
    price: 355000,
    currency: "NGN",
    wholesalePrice: 249.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 355000, currency: "NGN", wholesalePrice: 249.99, wholesaleCurrency: "USD" },
      { period: 2, price: 619000, currency: "NGN", wholesalePrice: 437.48, wholesaleCurrency: "USD" },
      { period: 3, price: 884000, currency: "NGN", wholesalePrice: 624.98, wholesaleCurrency: "USD" },
      { period: 4, price: 1148000, currency: "NGN", wholesalePrice: 812.47, wholesaleCurrency: "USD" },
      { period: 5, price: 1412000, currency: "NGN", wholesalePrice: 999.96, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 60,
    name: "S/MIME Personal",
    category: "domain_validation",
    validationMethod: "domain",
    deliveryTime: "15m",
    isWildcard: false,
    maxPeriod: 2,
    price: 29000,
    currency: "NGN",
    wholesalePrice: 18.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 29000, currency: "NGN", wholesalePrice: 18.99, wholesaleCurrency: "USD" },
      { period: 2, price: 48000, currency: "NGN", wholesalePrice: 31.99, wholesaleCurrency: "USD" },
      { period: 3, price: 67000, currency: "NGN", wholesalePrice: 45.99, wholesaleCurrency: "USD" },
      { period: 4, price: 87000, currency: "NGN", wholesalePrice: 59.99, wholesaleCurrency: "USD" },
      { period: 5, price: 108000, currency: "NGN", wholesalePrice: 74.99, wholesaleCurrency: "USD" },
    ],
  },
  {
    id: 28,
    name: "Unified Communications Certificate (UCC)",
    category: "multi_domain",
    validationMethod: "organization",
    deliveryTime: "up to 2 days",
    isWildcard: false,
    maxPeriod: 5,
    price: 59000,
    currency: "NGN",
    wholesalePrice: 39.99,
    wholesaleCurrency: "USD",
    prices: [
      { period: 1, price: 59000, currency: "NGN", wholesalePrice: 39.99, wholesaleCurrency: "USD" },
      { period: 2, price: 101000, currency: "NGN", wholesalePrice: 69.98, wholesaleCurrency: "USD" },
      { period: 3, price: 143000, currency: "NGN", wholesalePrice: 99.98, wholesaleCurrency: "USD" },
      { period: 4, price: 186000, currency: "NGN", wholesalePrice: 129.97, wholesaleCurrency: "USD" },
      { period: 5, price: 228000, currency: "NGN", wholesalePrice: 159.96, wholesaleCurrency: "USD" },
    ],
  },
];

// Product description lookup for OpenProvider card style
const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  "EssentialSSL": "An EssentialSSL certificate is an affordable solution for securing your lite website or blog.",
  "EssentialSSL Wildcard": "A Wildcard EssentialSSL certificate is an affordable solution for securing all subdomains on a single domain.",
  "Positive SSL": "Positive SSL Certificates are one of the most cost effective SSL Certificate available today. Issued within minutes.",
  "Positive SSL multi-domain": "Positive MDC SSL certificates can be issued within minutes of a successful application with our 100% online validation.",
  "Positive SSL Wildcard": "Secure unlimited subdomains over multiple servers on a single Positive SSL Wildcard certificate, the perfect scalable choice.",
  "S/MIME Personal": "Secure email certificates ensure email privacy and trust using encryption and digital signatures, security, and confidentiality.",
  "InstantSSL": "InstantSSL displays your verified organization name in certificate details to build customer and business trust online.",
  "InstantSSL Pro": "InstantSSL Pro provides full business validation with high warranty coverage, ideal for commercial transactions.",
  "PremiumSSL": "PremiumSSL delivers high-assurance organization validation for enterprise portals and high-traffic platforms.",
  "PremiumSSL Wildcard": "Enterprise-grade organization validation combined with unlimited subdomains security under one certificate.",
  "EV SSL": "Extended Validation (EV) triggers the highest level of consumer trust and verified company credentials.",
  "EVSSL multi-domain": "Combines enterprise Extended Validation (EV) with multi-domain SAN support to protect multiple company web properties.",
  "Code Signing": "Code signing certificates allow software publishers to digitally sign their code, including applications and drivers.",
  "Code Signing EV": "Hardware token backed EV code signing that provides instant reputation with Microsoft SmartScreen and removes warnings.",
  "Unified Communications Certificate (UCC)": "Engineered specifically for Microsoft Exchange, Office 365, and unified communications environments.",
};

function formatNGN(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function SslPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "order" ? "order" : "overview";

  const [activeTab, setActiveTab] = useState<"overview" | "order">(initialTab);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Expiring Soon">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // OpenProvider validation level filter card: null = All, or "domain_validation", "organization_validation", "extended_validation"
  const [selectedValidationLevel, setSelectedValidationLevel] = useState<string | null>(null);
  const [planSearchQuery, setPlanSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // Buy modal state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyDomain, setBuyDomain] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<number>(41);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);

  const { data: liveCerts, isLoading } = useGetSslCertificates();
  const { data: apiProducts } = useGetSslProducts();
  const { addSslItem, openDrawer } = useCartStore();

  // Combine API products with fallback list
  const products: SslProduct[] = useMemo(() => {
    if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
      return apiProducts;
    }
    return FALLBACK_SSL_PRODUCTS;
  }, [apiProducts]);

  // Existing user certificates
  const certificates: SslItem[] = useMemo(() => {
    if (!liveCerts || !Array.isArray(liveCerts)) {
      return [];
    }
    return liveCerts.map((c: any) => {
      let st: SslItem["status"] = "Active";
      const statusUpper = (c.status as string)?.toUpperCase();
      if (statusUpper === "EXPIRED") st = "Expired";
      else if (statusUpper === "PENDING" || statusUpper === "PROCESSING") st = "Pending";

      let expStr = "—";
      if (c.expiresAt) {
        const d = new Date(c.expiresAt);
        expStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const diffDays = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 30 && diffDays > 0) st = "Expiring Soon";
      }

      return {
        id: c.id,
        certificate: c.productName || "SSL Certificate",
        domain: c.domainName || "—",
        status: st,
        expires: expStr,
      };
    });
  }, [liveCerts]);

  // Filter items in Orders overview
  const filteredCerts = useMemo(() => {
    return certificates.filter((c) => {
      const matchesFilter =
        statusFilter === "All" ||
        (statusFilter === "Active" && c.status === "Active") ||
        (statusFilter === "Expiring Soon" && c.status === "Expiring Soon");

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.domain.toLowerCase().includes(q) ||
        c.certificate.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [certificates, statusFilter, searchQuery]);

  // Metrics
  const activeCount = certificates.filter((c) => c.status === "Active").length;
  const expiringSoonCount = certificates.filter((c) => c.status === "Expiring Soon").length;
  const expiredCount = certificates.filter((c) => c.status === "Expired").length;

  // OpenProvider bestsellers: EssentialSSL, EssentialSSL Wildcard, Positive SSL
  const bestsellersList = useMemo(() => {
    return products.filter((p) => [31, 32, 41].includes(p.id));
  }, [products]);

  // Other products for "Select certificate to order"
  const otherProductsList = useMemo(() => {
    return products.filter((p) => ![31, 32, 41].includes(p.id));
  }, [products]);

  // Apply validation level and search filters
  const filterProduct = (prod: SslProduct) => {
    if (selectedValidationLevel) {
      if (selectedValidationLevel === "domain_validation") {
        if (prod.category !== "domain_validation" && prod.category !== "wildcard" && prod.validationMethod !== "domain") {
          return false;
        }
      } else if (selectedValidationLevel === "organization_validation") {
        if (prod.category !== "organization_validation" && prod.validationMethod !== "organization") {
          return false;
        }
      } else if (selectedValidationLevel === "extended_validation") {
        if (prod.category !== "extended_validation" && prod.validationMethod !== "extended") {
          return false;
        }
      }
    }

    if (planSearchQuery.trim()) {
      const q = planSearchQuery.trim().toLowerCase();
      return (
        prod.name.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q) ||
        prod.validationMethod.toLowerCase().includes(q)
      );
    }

    return true;
  };

  const visibleBestsellers = bestsellersList.filter(filterProduct);
  const visibleOtherProducts = otherProductsList.filter(filterProduct);

  const toggleExpand = (id: number) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeModalProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProduct) || products[0];
  }, [products, selectedProduct]);

  const currentModalPrice = useMemo(() => {
    if (!activeModalProduct) return 15000;
    const match = activeModalProduct.prices?.find((p) => p.period === selectedPeriod);
    return match ? match.price : activeModalProduct.price || 15000;
  }, [activeModalProduct, selectedPeriod]);

  const handleOpenBuyModal = (productId: number, period: number = 1) => {
    setSelectedProduct(productId);
    setSelectedPeriod(period);
    setShowBuyModal(true);
  };

  const handleOrderSsl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }
    const cleanDomain = buyDomain.trim().toLowerCase().replace(/^https?:\/\//, "");

    const prod = products.find((p) => p.id === selectedProduct) || activeModalProduct;
    const priceObj = prod?.prices?.find((p) => p.period === selectedPeriod);
    const finalPrice = priceObj ? priceObj.price : prod?.price || 15000;

    addSslItem({
      type: "SSL",
      domainName: cleanDomain,
      price: finalPrice,
      productId: prod?.id || selectedProduct,
      period: selectedPeriod,
      productName: prod?.name || "SSL Certificate",
    });

    toast.success(`${prod?.name || "SSL Certificate"} for ${cleanDomain} added to cart`);
    setShowBuyModal(false);
    setBuyDomain("");
    openDrawer();
  };

  // Helper to render an OpenProvider style product card
  const renderProductCard = (prod: SslProduct) => {
    const isExpanded = !!expandedCards[prod.id];
    const desc =
      PRODUCT_DESCRIPTIONS[prod.name] ||
      `Industry-standard 256-bit encryption with ${prod.deliveryTime} issuance.`;

    const validationLabel =
      prod.validationMethod === "domain"
        ? "Domain validation"
        : prod.validationMethod === "organization"
        ? "Organization validation"
        : "Extended validation";

    return (
      <div
        key={prod.id}
        id={`ssl-card-${prod.id}`}
        className="bg-white border border-[#e2eaff] rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div>
          {/* Certificate Name */}
          <h3 className="text-[17px] font-bold text-[#1d1d1f] tracking-tight">
            {prod.name}
          </h3>

          {/* Type / Validation Tag */}
          <div className="mt-2 text-[12px] text-[#6e6e73]">
            <span className="font-medium mr-2">Type</span>
            <span className="text-[#1d1d1f] font-semibold">{validationLabel}</span>
          </div>

          {/* Description */}
          <p className="mt-2 text-[12.5px] text-[#5a6a85] leading-relaxed line-clamp-3">
            {desc}
          </p>

          {/* More ▾ / Less ▴ Button */}
          <button
            type="button"
            onClick={() => toggleExpand(prod.id)}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#f8fafc] border border-[#e2eaff] rounded-lg text-xs font-semibold text-[#1d1d1f] transition-colors"
          >
            <span>{isExpanded ? "Less" : "More"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#6e6e73]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#6e6e73]" />
            )}
          </button>

          {/* Expanded Information Drawer */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-[#f0f4f9] text-xs text-[#5a6a85] flex flex-col gap-2 bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
              <div className="flex items-center justify-between">
                <span className="font-medium">Issuance Speed:</span>
                <span className="font-bold text-[#1d1d1f] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#1787D4]" />
                  {prod.deliveryTime}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Wildcard Support:</span>
                <span className="font-bold text-[#1d1d1f]">
                  {prod.isWildcard ? "Yes (*.domain.com)" : "No (Single domain)"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Max Validity:</span>
                <span className="font-bold text-[#1d1d1f]">{prod.maxPeriod} Years</span>
              </div>

              {/* Multi-year Price Breakdown */}
              <div className="mt-1 pt-2 border-t border-[#eef2f8]">
                <span className="font-semibold text-[#1d1d1f] block mb-1">
                  Duration Pricing:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11.5px]">
                  {prod.prices?.map((pr) => (
                    <div
                      key={pr.period}
                      className="flex items-center justify-between bg-white px-2 py-1 rounded border border-[#e2eaff]"
                    >
                      <span>{pr.period} {pr.period === 1 ? "Year" : "Years"}:</span>
                      <span className="font-bold text-[#1787D4]">{formatNGN(pr.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: From Price & Order Now Button */}
        <div className="mt-5 pt-3 border-t border-[#f0f4f9]">
          <div className="mb-3">
            <span className="text-[11.5px] text-[#6e6e73] block font-medium">From</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-extrabold text-[#1d1d1f] tracking-tight">
                {formatNGN(prod.price)}
              </span>
              <span className="text-xs text-[#9ba8c0] line-through">
                ${prod.wholesalePrice}
              </span>
            </div>
          </div>

          <button
            type="button"
            id={`btn-order-${prod.id}`}
            onClick={() => handleOpenBuyModal(prod.id, 1)}
            className="w-full py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-all active:scale-98 text-center cursor-pointer"
          >
            Order Now
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
            style={{
              fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            SSL certificates
          </h1>
          <p className="text-[14px] mt-0.5 text-[#6e6e73]">
            Manage installed certificates or order new high-assurance SSL/TLS encryption.
          </p>
        </div>

        {/* Quick action button */}
        {activeTab === "overview" && (
          <button
            type="button"
            onClick={() => setActiveTab("order")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Order new certificate
          </button>
        )}
      </div>

      {/* OpenProvider Style Sidebar Tabs / Sub-Navigation */}
      <div className="flex border-b border-[#e2eaff] gap-8">
        <button
          type="button"
          id="tab-orders-overview"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-[14px] font-semibold transition-colors relative cursor-pointer ${
            activeTab === "overview"
              ? "text-[#1787D4]"
              : "text-[#6e6e73] hover:text-[#1d1d1f]"
          }`}
        >
          Orders overview
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#f0f4f9] text-[#5a6a85] font-medium">
            {isLoading ? "…" : certificates.length}
          </span>
          {activeTab === "overview" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1787D4] rounded-t-full" />
          )}
        </button>

        <button
          type="button"
          id="tab-order-new-certificate"
          onClick={() => setActiveTab("order")}
          className={`pb-3 text-[14px] font-semibold transition-colors relative cursor-pointer ${
            activeTab === "order"
              ? "text-[#1787D4]"
              : "text-[#6e6e73] hover:text-[#1d1d1f]"
          }`}
        >
          Order new certificate
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#e8f4fc] text-[#1787D4] font-semibold">
            {products.length}
          </span>
          {activeTab === "order" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1787D4] rounded-t-full" />
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TAB 1: ORDER NEW CERTIFICATE (OpenProvider Showcase)
         ───────────────────────────────────────────────────────────────── */}
      {activeTab === "order" && (
        <div className="flex flex-col gap-6">
          {/* Main Title & Subtitle */}
          <div>
            <h2 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight">
              Order SSL certificate
            </h2>
            <p className="text-[13px] text-[#6e6e73] mt-1">
              What certificate to choose?
            </p>
          </div>


          {/* 3 Top Validation Level Selector Cards (DV, OV, EV) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Basic SSL (DV) */}
            <div
              onClick={() =>
                setSelectedValidationLevel((prev) =>
                  prev === "domain_validation" ? null : "domain_validation"
                )
              }
              className={`bg-white border rounded-xl p-5 shadow-xs cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                selectedValidationLevel === "domain_validation"
                  ? "border-[#1787D4] ring-1 ring-[#1787D4] shadow-sm"
                  : "border-[#e2eaff] hover:border-[#1787D4]/60"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#eff6fc] flex items-center justify-center text-[#1787D4] shrink-0 border border-[#d8eaf8]">
                  <Shield className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[14.5px] font-bold text-[#1d1d1f]">
                    Basic SSL (DV)
                  </h4>
                  <p className="text-[12px] text-[#6e6e73] mt-1 leading-relaxed">
                    Basic protection and domain/site ownership validation
                  </p>
                </div>
              </div>

              {/* Blue bottom highlight line when active */}
              {selectedValidationLevel === "domain_validation" && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1787D4]" />
              )}
            </div>

            {/* Card 2: Business SSL (OV) */}
            <div
              onClick={() =>
                setSelectedValidationLevel((prev) =>
                  prev === "organization_validation" ? null : "organization_validation"
                )
              }
              className={`bg-white border rounded-xl p-5 shadow-xs cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                selectedValidationLevel === "organization_validation"
                  ? "border-[#1787D4] ring-1 ring-[#1787D4] shadow-sm"
                  : "border-[#e2eaff] hover:border-[#1787D4]/60"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#eaf8ee] flex items-center justify-center text-[#1e824c] shrink-0 border border-[#c7ebd1]">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[14.5px] font-bold text-[#1d1d1f]">
                    Business SSL (OV)
                  </h4>
                  <p className="text-[12px] text-[#6e6e73] mt-1 leading-relaxed">
                    Domain/website and company information validation
                  </p>
                </div>
              </div>

              {selectedValidationLevel === "organization_validation" && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1787D4]" />
              )}
            </div>

            {/* Card 3: Premium SSL (EV) */}
            <div
              onClick={() =>
                setSelectedValidationLevel((prev) =>
                  prev === "extended_validation" ? null : "extended_validation"
                )
              }
              className={`bg-white border rounded-xl p-5 shadow-xs cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                selectedValidationLevel === "extended_validation"
                  ? "border-[#1787D4] ring-1 ring-[#1787D4] shadow-sm"
                  : "border-[#e2eaff] hover:border-[#1787D4]/60"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#f5eefb] flex items-center justify-center text-[#7e3af2] shrink-0 border border-[#e4ccf8]">
                  <Lock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[14.5px] font-bold text-[#1d1d1f]">
                    Premium SSL (EV)
                  </h4>
                  <p className="text-[12px] text-[#6e6e73] mt-1 leading-relaxed">
                    Extended protection and security
                  </p>
                </div>
              </div>

              {selectedValidationLevel === "extended_validation" && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1787D4]" />
              )}
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedValidationLevel(null)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedValidationLevel === null
                    ? "bg-[#1787D4] text-white shadow-xs"
                    : "bg-white border border-[#e2eaff] text-[#6e6e73] hover:text-[#1d1d1f]"
                }`}
              >
                All Categories ({products.length})
              </button>

              {selectedValidationLevel && (
                <button
                  type="button"
                  onClick={() => setSelectedValidationLevel(null)}
                  className="px-2.5 py-1 text-xs text-[#6e6e73] hover:text-[#1d1d1f] flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear filter
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#9ba8c0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search certificate..."
                value={planSearchQuery}
                onChange={(e) => setPlanSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors"
              />
            </div>
          </div>

          {/* ────────────────── SECTION 1: OUR BESTSELLERS ────────────────── */}
          {visibleBestsellers.length > 0 && (
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-[20px] font-bold text-[#1d1d1f] text-center tracking-tight">
                Our bestsellers
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {visibleBestsellers.map(renderProductCard)}
              </div>
            </div>
          )}

          {/* ────────────────── SECTION 2: SELECT CERTIFICATE TO ORDER ────────────────── */}
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-[18px] font-bold text-[#1d1d1f] tracking-tight">
              Select certificate to order
            </h3>

            {visibleOtherProducts.length === 0 && visibleBestsellers.length === 0 ? (
              <div className="bg-white border border-[#e2eaff] rounded-2xl p-12 text-center">
                <p className="text-sm font-semibold text-[#1d1d1f]">
                  No certificates match your search filter
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedValidationLevel(null);
                    setPlanSearchQuery("");
                  }}
                  className="mt-3 px-4 py-2 bg-[#1787D4] text-white text-xs font-semibold rounded-lg"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {visibleOtherProducts.map(renderProductCard)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 2: ORDERS OVERVIEW (Existing User Certificates)
         ───────────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* Top 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Active */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
              <span className="text-[13px] font-medium text-[#6e6e73]">Active</span>
              <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" /> : activeCount}
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
              <span className="text-[13px] font-medium text-[#6e6e73]">Expiring Soon</span>
              <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" /> : expiringSoonCount}
              </div>
            </div>

            {/* Expired */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
              <span className="text-[13px] font-medium text-[#6e6e73]">Expired</span>
              <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" /> : expiredCount}
              </div>
            </div>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {(["All", "Active", "Expiring Soon"] as const).map((filter) => {
                const isActive = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    id={`btn-ssl-filter-${filter.toLowerCase().replace(/\s+/g, "-")}`}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[#1787D4] text-white shadow-sm"
                        : "bg-white border border-[#e2eaff] text-[#6e6e73] hover:text-[#1d1d1f]"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 flex-1 sm:justify-end">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#9ba8c0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("order")}
                className="px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap"
              >
                Order New Certificate
              </button>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-sm overflow-hidden mt-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Certificate
                    </th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Domain
                    </th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Status
                    </th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Expires
                    </th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f5fc]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[13.5px] text-[#6e6e73]">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
                          <span>Loading SSL certificates…</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCerts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-[#eff6fc] flex items-center justify-center text-[#1787D4]">
                            <Shield className="w-6 h-6 stroke-[2]" />
                          </div>
                          <p className="text-[14.5px] font-bold text-[#1d1d1f] mt-1">
                            No SSL certificates found
                          </p>
                          <p className="text-[13px] text-[#6e6e73] text-center">
                            Protect your websites with instant SSL/TLS certificates.
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab("order")}
                            className="mt-3 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
                          >
                            Order New Certificate
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCerts.map((cert) => {
                      const isActive = cert.status === "Active";
                      const isExpiring = cert.status === "Expiring Soon";
                      const isExpired = cert.status === "Expired";

                      return (
                        <tr
                          key={cert.id}
                          className="hover:bg-[#fbfcfe] transition-colors duration-150"
                        >
                          <td className="py-4 px-6 text-[13.5px] font-semibold text-[#1d1d1f]">
                            {cert.certificate}
                          </td>
                          <td className="py-4 px-6 text-[13.5px] text-[#1d1d1f] font-mono">
                            {cert.domain}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${
                                isActive
                                  ? "bg-[#eaf8ee] text-[#1e824c]"
                                  : isExpiring
                                  ? "bg-[#fff8ea] text-[#b37400]"
                                  : isExpired
                                  ? "bg-[#fdeaea] text-[#d92d20]"
                                  : "bg-[#eff6fc] text-[#1787D4]"
                              }`}
                            >
                              {isActive ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : isExpiring ? (
                                <ShieldAlert className="w-3.5 h-3.5" />
                              ) : isExpired ? (
                                <AlertCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 animate-pulse" />
                              )}
                              {cert.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-[13.5px] text-[#6e6e73]">
                            {cert.expires}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {isExpired ? (
                              <button
                                type="button"
                                onClick={() => {
                                  addSslItem({
                                    type: "SSL",
                                    domainName: cert.domain,
                                    price: 15000,
                                    productId: 41,
                                    period: 1,
                                    productName: "Positive SSL",
                                  });
                                  toast.success(`SSL Renewal for ${cert.domain} added to cart`);
                                  openDrawer();
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold rounded-lg transition-colors shadow-xs"
                              >
                                Renew
                              </button>
                            ) : (
                              <Link
                                href={`/dashboard/ssl/${encodeURIComponent(cert.id || cert.domain)}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#e2eaff] hover:bg-[#f2f5fc] text-[#1787D4] text-[12.5px] font-semibold rounded-lg transition-colors"
                              >
                                Manage
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          ORDER MODAL (Domain input, duration, summary & add to cart)
         ───────────────────────────────────────────────────────────────── */}
      {showBuyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBuyModal(false)}
          />
          <div className="relative bg-white border border-[#e2eaff] rounded-2xl w-full max-w-lg shadow-2xl p-6 flex flex-col gap-4 my-8 z-10">
            <div className="flex items-center justify-between border-b border-[#f0f4f9] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1d1d1f]">
                  Order SSL Certificate
                </h3>
                <p className="text-xs text-[#6e6e73] mt-0.5">
                  Configure domain and validity period for your SSL certificate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBuyModal(false)}
                className="p-1.5 text-[#9ba8c0] hover:bg-[#f2f5fc] hover:text-[#031033] rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOrderSsl} className="flex flex-col gap-4">
              {/* Domain Input */}
              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  Domain Name *
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#9ba8c0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={
                      activeModalProduct?.isWildcard
                        ? "*.example.com or example.com"
                        : "example.com"
                    }
                    value={buyDomain}
                    onChange={(e) => setBuyDomain(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4] transition-colors"
                    required
                  />
                </div>
                <span className="text-[11px] text-[#6e6e73] mt-1 block">
                  {activeModalProduct?.isWildcard
                    ? "Wildcard certificates secure your root domain and all its subdomains."
                    : "Enter the fully qualified domain name to secure."}
                </span>
              </div>

              {/* Certificate Selection Dropdown */}
              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  Certificate Plan
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    const newId = Number(e.target.value);
                    setSelectedProduct(newId);
                    const newProd = products.find((p) => p.id === newId);
                    if (newProd && selectedPeriod > newProd.maxPeriod) {
                      setSelectedPeriod(1);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4] bg-white cursor-pointer"
                >
                  <optgroup label="Bestsellers">
                    {bestsellersList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatNGN(p.price)}/yr ({p.deliveryTime})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Available Certificates">
                    {otherProductsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatNGN(p.price)}/yr ({p.deliveryTime})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Validity Period Options */}
              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  Validity Period
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeModalProduct?.prices?.map((pr) => {
                    const isSelected = selectedPeriod === pr.period;
                    return (
                      <button
                        key={pr.period}
                        type="button"
                        onClick={() => setSelectedPeriod(pr.period)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-[#1787D4] bg-[#eff6fc] text-[#1787D4] ring-1 ring-[#1787D4]"
                            : "border-[#e2eaff] bg-white hover:bg-[#f8fafc] text-[#1d1d1f]"
                        }`}
                      >
                        <span className="text-xs font-bold block">
                          {pr.period} {pr.period === 1 ? "Year" : "Years"}
                        </span>
                        <span className="text-[11px] font-medium text-[#5a6a85] block mt-0.5">
                          {formatNGN(pr.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-[#fbfcfe] border border-[#e2eaff] rounded-xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-[#5a6a85]">
                  <span>Product:</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    {activeModalProduct?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#5a6a85]">
                  <span>Validation & Delivery:</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    {activeModalProduct?.validationMethod} • {activeModalProduct?.deliveryTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#5a6a85]">
                  <span>Duration:</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    {selectedPeriod} {selectedPeriod === 1 ? "Year" : "Years"}
                  </span>
                </div>
                <div className="border-t border-[#eef2f8] pt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-[#1d1d1f]">Total Amount:</span>
                  <span className="font-extrabold text-[#1787D4] text-base">
                    {formatNGN(currentModalPrice)}
                  </span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="modal-submit-ssl"
                  className="px-5 py-2.5 text-xs font-semibold bg-[#1787D4] hover:bg-[#1371B5] text-white rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Cart ({formatNGN(currentModalPrice)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SslCertificatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#6e6e73]">Loading SSL certificates…</p>
        </div>
      }
    >
      <SslPageContent />
    </Suspense>
  );
}
