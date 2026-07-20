import { useAuthStore } from "@/store/authStore";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://cloud-backend-chi.vercel.app/api";

// lib/api.ts

// Prevents multiple simultaneous token refresh calls.
// All in-flight 401 requests are queued and replayed once refresh resolves.
let isRefreshing = false;
type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
const failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue.length = 0;
}

const fetchWithRefresh = async (
  url: string,
  options: RequestInit,
): Promise<Response> => {
  let res = await fetch(url, options);

  // Access token expired — attempt a silent refresh
  if (res.status === 401) {
    // If a refresh is already in flight, queue this request until it resolves.
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            const retryOptions: RequestInit = {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
              },
            };
            resolve(fetch(url, retryOptions));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // sends the httpOnly refresh-token cookie
      });

      if (refreshRes.ok) {
        const body = await refreshRes.json();
        // Support both { accessToken } and { data: { accessToken } } shapes
        const newToken: string =
          body?.accessToken ??
          body?.data?.accessToken ??
          body?.token ??
          body?.data?.token;

        // Persist the new access token in the store
        useAuthStore.getState().setToken(newToken);

        // Unblock all queued requests with the new token
        processQueue(null, newToken);

        // Retry the original request with the fresh token
        res = await fetch(url, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
        });
      } else {
        processQueue(new Error("Session expired"), null);
        // Refresh token is also expired — force a clean logout
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } catch (err) {
      processQueue(err, null);
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } finally {
      isRefreshing = false;
    }
  }

  return res;
};

const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Parses the response and throws an Error with the backend message on non-2xx.
// Handles both simple { message } and Zod-style { message, error: string[] } shapes.
// NOTE: Do NOT log out on 401 here — fetchWithRefresh already handles the
// token-refresh retry before this function is called.
const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    const details =
      Array.isArray(data?.error) && data.error.length > 0
        ? data.error.join(" · ")
        : null;
    throw new Error(
      details || data?.message || `Request failed (${res.status})`,
    );
  }
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const registerUser = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  companyName: string;
  address: string;
  houseNumber?: string;
  country: string;
  city: string;
  state?: string;
  postcode: string;
}) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  }).then(handleResponse);

export const loginUser = (data: { email: string; password: string }) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  }).then(handleResponse);

export const logoutUser = () =>
  fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  }).then(handleResponse);

export const refresh = () =>
  fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  }).then(handleResponse);

export const verifyOTP = (data: { email: string; code: string }) =>
  fetch(`${BASE_URL}/auth/verify`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  }).then(handleResponse);

export const resendOTP = (data: { email: string }) =>
  fetch(`${BASE_URL}/auth/resend`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ── Protected (auto-refresh token) ───────────────────────────────────────────

export const getMe = () =>
  fetchWithRefresh(`${BASE_URL}/auth/me`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const updateProfile = (
  token: string,
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    companyName?: string;
    address?: string;
    houseNumber?: string;
    country?: string;
    city?: string;
    state?: string;
    postcode?: string;
  },
) =>
  fetchWithRefresh(`${BASE_URL}/users/profile`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const changePassword = (
  token: string,
  data: { oldPassword: string; newPassword: string },
) =>
  fetchWithRefresh(`${BASE_URL}/users/change-password`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ── Password Reset ────────────────────────────────────────────────────────────

/** Step 1 – request OTP; backend sends code to the user's email. */
export const forgotPassword = (data: { email: string }) =>
  fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

/** Step 2 – submit OTP; returns { resetToken } valid for 10 min. */
export const verifyResetOTP = (data: { email: string; code: string }) =>
  fetch(`${BASE_URL}/auth/verify-reset-otp`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

/** Step 3 – set new password using the short-lived reset token. */
export const resetPassword = (data: {
  resetToken: string;
  newPassword: string;
}) =>
  fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ── Plans ─────────────────────────────────────────────────────────────────────

export type Plan = {
  id: string;
  name: string;
  price: number;
  monthlyPrice: number;
  quarterlyPrice: number;
  billingCycle: string;
  storage: string;
  bandwidth: string;
  websites: number;
  emails: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const getPlans = (): Promise<{
  success: boolean;
  data: Plan[];
  message: string;
  error: null | string;
}> =>
  fetch(`${BASE_URL}/plans`, {
    headers: getHeaders(),
  }).then(handleResponse);

// ── Hosting ───────────────────────────────────────────────────────────────────

// Status matches Prisma enum: ACTIVE | SUSPENDED | TERMINATED
export type HostingStatus = "ACTIVE" | "SUSPENDED" | "TERMINATED" | "PENDING";

export type HostingAccount = {
  id: string;
  domain: string;
  status: HostingStatus;
  // Returned by getHostings with include: { plan: true }
  plan?: { id: string; name: string; price: number; billingCycle: string };
  planId: string;
  expiresAt: string; // Prisma field name
  cpanelUsername?: string;
  serverIp?: string;
  createdAt: string;
  updatedAt: string;
  orderItemId?: string | null;
};

export type HostingStats = {
  domain: string;
  plan: string;
  ip: string;
  diskUsed: string;
  diskLimit: string;
  inodesUsed: number;
  inodesLimit: string;
  maxEmails: string;
  maxFTP: string;
  maxDatabases: string;
  maxSubdomains: string;
  maxAddonDomains: string;
  maxEmailPerHour: string;
  maxEmailQuotaMB: string;
  status: HostingStatus;
  suspendReason: string;
  startDate: string;
};

export type HostingEmail = {
  email: string;
  domain: string;
  diskused: string;
  diskquota: string;
  login: string;
};

export type HostingForwarder = {
  dest: string;
  html_dest: string;
  forward: string;
  html_forward: string;
  uri_dest: string;
  uri_forward: string;
};

export type HostingDatabase = {
  database: string;
  diskusage?: string;
  users?: string[];
};

export type HostingDatabaseUser = {
  user: string;
};

export type ProvisionHostingPayload = {
  domain: string;
  planId: string;
};

export type ProvisionHostingResult = {
  id: string;
  domain: string;
  cpanelUsername: string;
  cpanelPassword: string;
  cpanelUrl: string;
  status: string;
  expiresAt: string;
};

export const getHosting = (
  token: string,
): Promise<{ success: boolean; data: HostingAccount[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const getHostingById = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingAccount; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const provisionHosting = (
  token: string,
  data: ProvisionHostingPayload,
): Promise<{
  success: boolean;
  data: ProvisionHostingResult;
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/hosting`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteHosting = (
  token: string,
  id: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  }).then(handleResponse);

export const suspendHosting = (
  token: string,
  id: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/suspend`, {
    method: "POST",
    headers: getHeaders(),
  }).then(handleResponse);

export const unsuspendHosting = (
  token: string,
  id: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/unsuspend`, {
    method: "POST",
    headers: getHeaders(),
  }).then(handleResponse);

export const getHostingStats = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingStats; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/stats`, {
    headers: getHeaders(),
  }).then(handleResponse);

/** GET /hosting/:id/cpanel-login — generates a one-time session login URL for cPanel */
export const getCpanelLoginLink = (
  id: string,
): Promise<{ success: boolean; data: { loginUrl: string }; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/cpanel-login`, {
    headers: getHeaders(),
  }).then(handleResponse);

// ── Hosting Emails ─────────────────────────────────────────────────────────────

export const getHostingEmails = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingEmail[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/emails`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const createHostingEmail = (
  token: string,
  id: string,
  data: { email: string; password: string },
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/emails`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteHostingEmail = (
  token: string,
  id: string,
  email: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(
    `${BASE_URL}/hosting/${id}/emails/${encodeURIComponent(email)}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  ).then(handleResponse);

export const changeHostingEmailPassword = (
  token: string,
  id: string,
  email: string,
  password: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(
    `${BASE_URL}/hosting/${id}/emails/${encodeURIComponent(email)}/password`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ password }),
    },
  ).then(handleResponse);

// ── Hosting Email Forwarders ───────────────────────────────────────────────────

export const getHostingForwarders = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingForwarder[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/emails/forwarders`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const createHostingForwarder = (
  token: string,
  id: string,
  data: { source: string; destination: string },
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/emails/forwarders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteHostingForwarder = (
  token: string,
  id: string,
  address: string, // source email on the domain  e.g. no-reply@demobusiness.com
  forwarder: string, // destination email            e.g. akindav16@gmail.com
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(
    `${BASE_URL}/hosting/${id}/emails/forwarders?address=${encodeURIComponent(address)}&forwarder=${encodeURIComponent(forwarder)}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  ).then(handleResponse);

// ── Hosting Databases ──────────────────────────────────────────────────────────

export const getHostingDatabases = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingDatabase[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/databases`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const createHostingDatabase = (
  token: string,
  id: string,
  data: { database: string },
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/databases`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteHostingDatabase = (
  token: string,
  id: string,
  database: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(
    `${BASE_URL}/hosting/${id}/databases/${encodeURIComponent(database)}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  ).then(handleResponse);

export const getHostingDatabaseUsers = (
  token: string,
  id: string,
): Promise<{
  success: boolean;
  data: HostingDatabaseUser[];
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/databases/users`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const createHostingDatabaseUser = (
  token: string,
  id: string,
  data: { user: string; password?: string },
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/databases/users`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteHostingDatabaseUser = (
  token: string,
  id: string,
  user: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(
    `${BASE_URL}/hosting/${id}/databases/users/${encodeURIComponent(user)}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  ).then(handleResponse);

export const assignHostingDatabaseUser = (
  token: string,
  id: string,
  data: { database: string; user: string; privileges?: string[] },
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/databases/users/assign`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ── Orders ────────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PAID" | "FAILED";

/** A single line-item inside an order (HOSTING, DOMAIN, or SSL) */
export type OrderItem = {
  id: string;
  type: "HOSTING" | "DOMAIN" | "SSL";
  price: number;
  domainName?: string;
  plan?: Plan; // present for HOSTING items
  planId?: string;
  hostingAccountId?: string | null;
};

/** Backend cart item shapes sent to POST /orders/initialize */
export type BackendCartItem =
  | { type: "HOSTING"; planId: string; billingCycle?: "monthly" | "quarterly" | "yearly" }
  | { type: "DOMAIN"; domainName: string; extension: string }
  | { type: "DOMAIN_TRANSFER"; domainName: string; extension: string; authCode: string }
  | { type: "SSL"; domainName: string };

export type Order = {
  id: string;
  userId: string;
  amount: number;
  status: OrderStatus;
  paystackRef: string;
  /** WHMCS invoice ID — present once the order has been synced to WHMCS */
  whmcsInvoiceId?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type InitializeCartPaymentResult = {
  paymentUrl: string;
  reference: string;
  total: number;
};

export type VerifyPaymentResult = {
  status: OrderStatus;
  items: OrderItem[];
  amount: number;
  reference: string;
};

/**
 * POST /orders/initialize — creates a Paystack checkout session for a
 * cart of HOSTING, DOMAIN, and/or SSL items.
 */
export const initializeCartPayment = (
  data: { items: BackendCartItem[] },
): Promise<{
  success: boolean;
  data: InitializeCartPaymentResult;
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/orders/initialize`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

/** GET /orders/verify/:reference — verifies a Paystack payment */
export const verifyPayment = (
  token: string,
  reference: string,
): Promise<{ success: boolean; data: VerifyPaymentResult; message: string }> =>
  fetchWithRefresh(
    `${BASE_URL}/orders/verify/${encodeURIComponent(reference)}`,
    {
      headers: getHeaders(),
    },
  ).then(handleResponse);

/** GET /orders — list all orders for the current user */
export const getOrders = (
  token: string,
): Promise<{ success: boolean; data: Order[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/orders`, {
    headers: getHeaders(),
  }).then(handleResponse);

/**
 * GET /orders/:orderId/invoice/download
 * Streams a PDF blob — uses the Bearer token because this endpoint
 * is auth-protected and the app is JWT-based (not cookie-based).
 */
export const downloadInvoice = async (orderId: string): Promise<Blob> => {
  const res = await fetchWithRefresh(
    `${BASE_URL}/orders/${encodeURIComponent(orderId)}/invoice/download`,
    { headers: getHeaders() },
  );
  if (!res.ok) {
    // Try to parse a JSON error message; fall back to a generic one.
    let msg = `Failed to download invoice (${res.status})`;
    try {
      const body = await res.clone().json();
      if (body?.message) msg = body.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(msg);
  }
  return res.blob();
};

// ── Domains ───────────────────────────────────────────────────────────────────

export type DomainResult = {
  domain: string;
  available: boolean;
  isPremium: boolean;
  price: {
    price: number | null;
    currency: string | null;
  };
};

/** POST /domains/search — check availability of a domain name across multiple TLDs */
export const searchDomains = (
  term: string,
): Promise<{ success: boolean; data: DomainResult[]; message: string }> =>
  fetch(`${BASE_URL}/domains/search?term=${encodeURIComponent(term)}`, {
    method: "POST",
    headers: getHeaders(),
  }).then(handleResponse);

export type RegisteredDomain = {
  id: string;
  domain: string;
  status: "ACTIVE" | "EXPIRED" | "PENDING";
  expiryDate: string;
  registrationDate: string;
  autoRenew: boolean;
  /** Current nameservers — defaults to ["ns1.nupatcloud.com","ns2.nupatcloud.com"] */
  nameservers?: string[];
};

/** GET /domains — list all registered domains for the current user */
export const getRegisteredDomains = (
  token: string,
): Promise<{ success: boolean; data: RegisteredDomain[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/domains`, {
    headers: getHeaders(),
  }).then(handleResponse);

/** GET /domains/:id — get a single domain details by ID */
export const getDomainById = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: RegisteredDomain; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/domains/${encodeURIComponent(id)}`, {
    headers: getHeaders(),
  }).then(handleResponse);

/** PUT /domains/:domainId/nameservers — update nameservers (2–4 entries) */
export const updateNameservers = (
  domainId: string,
  nameservers: string[],
): Promise<{ success: boolean; data: { id: string; name: string; nameservers: string[]; updatedAt: string }; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/domains/${encodeURIComponent(domainId)}/nameservers`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ nameservers }),
  }).then(handleResponse);

// (Domain Orders are now handled by the unified cart — see initializeCartPayment)

// ── Billing (WHMCS) ───────────────────────────────────────────────────────────

export type WhmcsInvoice = {
  id: string;
  date: string;
  duedate: string;
  total: string;
  status:
    | "Paid"
    | "Unpaid"
    | "Cancelled"
    | "Refunded"
    | "Collections"
    | "Draft";
};

export type BillingOverview = {
  invoices: WhmcsInvoice[];
  totalInvoices: number;
  creditBalance: string | number;
  currency: string;
};

/** GET /billing/overview — fetches WHMCS invoices + credit balance for the current user */
export const getBillingOverview = (
  token: string,
): Promise<{ success: boolean; data: BillingOverview; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/billing/overview`, {
    headers: getHeaders(),
  }).then(handleResponse);

// ── Hosting DNS Records ───────────────────────────────────────────────────────

export type DNSRecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "TXT"
  | "NS"
  | "PTR"
  | "SRV"
  | "CAA";

export type DNSRecord = {
  /** WHM zone line number — used as the record identifier for edit/delete */
  line: number;
  name: string;
  type: DNSRecordType | string;
  /** Unified address field (covers address / cname / exchange / txtdata) */
  address: string;
  ttl: number;
  priority: number | null;
};

export type CreateDNSRecordPayload = {
  name: string;
  type: DNSRecordType;
  address: string;
  ttl: number;
  priority?: number;
};

export type UpdateDNSRecordPayload = CreateDNSRecordPayload & {
  /** WHM line number of the record to edit */
  line: number;
};

/** GET /hosting/:id/dns — list all DNS records for a hosting account */
export const getDNSRecords = (
  id: string,
): Promise<{ success: boolean; data: DNSRecord[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/dns`, {
    headers: getHeaders(),
  }).then(handleResponse);

/** POST /hosting/:id/dns — add a new DNS record */
export const createDNSRecord = (
  id: string,
  data: CreateDNSRecordPayload,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/dns`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

/** PATCH /hosting/:id/dns/:recordId — update an existing DNS record */
export const updateDNSRecord = (
  id: string,
  line: number,
  data: UpdateDNSRecordPayload,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/dns/${line}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

/** DELETE /hosting/:id/dns/:recordId — delete a DNS record by line number */
export const deleteDNSRecord = (
  id: string,
  line: number,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/dns/${line}`, {
    method: "DELETE",
    headers: getHeaders(),
  }).then(handleResponse);

// ── Domain DNS Records ────────────────────────────────────────────────────────

/** GET /domains/:id/dns — list all DNS records for a purchased domain */
export const getDomainDNSRecords = (
  id: string,
): Promise<{ success: boolean; data: DNSRecord[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/domains/${id}/dns`, {
    headers: getHeaders(),
  }).then(handleResponse);

/** POST /domains/:id/dns — add a new DNS record to a purchased domain */
export const createDomainDNSRecord = (
  id: string,
  data: CreateDNSRecordPayload,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/domains/${id}/dns`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

/** PATCH /domains/:id/dns/:recordId — update an existing DNS record on a purchased domain */
export const updateDomainDNSRecord = (
  id: string,
  line: number,
  data: UpdateDNSRecordPayload,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/domains/${id}/dns/${line}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

/** DELETE /domains/:id/dns/:recordId — delete a DNS record from a purchased domain */
export const deleteDomainDNSRecord = (
  id: string,
  line: number,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/domains/${id}/dns/${line}`, {
    method: "DELETE",
    headers: getHeaders(),
  }).then(handleResponse);

// ── Domain Transfers ──────────────────────────────────────────────────────────

export type TransferEligibilityResult = {
  domainName: string;
  transferable: boolean;
  price: number;
};

export type DomainTransfer = {
  id: string;
  domainName: string;
  direction: "IN" | "OUT";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
};

/** POST /domains/transfer-in/check — check if domain is eligible for transfer and get price */
export const checkTransferEligibility = (data: {
  domainName: string;
  authCode: string;
}): Promise<{
  success: boolean;
  data: TransferEligibilityResult;
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/domains/transfer-in/check`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

/** GET /domains/transfers — list user's transfers */
export const getTransfers = (): Promise<{
  success: boolean;
  data: DomainTransfer[];
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/domains/transfers`, {
    headers: getHeaders(),
  }).then(handleResponse);

/** GET /domains/transfers/:id/status — request status update and return updated transfer info */
export const getTransferStatus = (
  id: string,
): Promise<{
  success: boolean;
  data: DomainTransfer;
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/domains/transfers/${encodeURIComponent(id)}/status`, {
    headers: getHeaders(),
  }).then(handleResponse);

/** GET /domains/:id/auth-code — request auth code for transfer out */
export const getDomainAuthCode = (
  id: string,
): Promise<{
  success: boolean;
  data: { authCode: string };
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/domains/${encodeURIComponent(id)}/auth-code`, {
    headers: getHeaders(),
  }).then(handleResponse);

// ── SSL Certificates ──────────────────────────────────────────────────────────

export type SslStatus = "PENDING" | "PROCESSING" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "FAILED";

export type SslCertificate = {
  id: string;
  domainName: string;
  productId: number;
  productName: string;
  openproviderId?: number | null;
  status: SslStatus;
  validationMethod: string;
  csr?: string | null;
  certificate?: string | null;
  privateKey?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const getSSLCertificates = (
  token: string,
): Promise<{ success: boolean; data: SslCertificate[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/ssl`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const getSSLStatus = (
  token: string,
  id: string,
): Promise<{
  success: boolean;
  data: {
    status: SslStatus;
    certificate?: string | null;
    expiresAt?: string | null;
    domainName?: string;
    productName?: string;
    validationMethod?: string;
    id?: string;
  };
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/ssl/${encodeURIComponent(id)}/status`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const getSSLProducts = (
  token: string,
): Promise<{ success: boolean; data: any[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/ssl/products`, {
    headers: getHeaders(),
  }).then(handleResponse);

/**
 * GET /ssl/:id/download
 * Streams a PEM certificate file blob
 */
export const downloadSSLCertificateFile = async (id: string): Promise<Blob> => {
  const res = await fetchWithRefresh(
    `${BASE_URL}/ssl/${encodeURIComponent(id)}/download`,
    { headers: getHeaders() },
  );
  if (!res.ok) {
    let msg = `Failed to download SSL certificate (${res.status})`;
    try {
      const body = await res.clone().json();
      if (body?.message) msg = body.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(msg);
  }
  return res.blob();
};
