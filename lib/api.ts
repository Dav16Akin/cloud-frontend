import { useAuthStore } from "@/store/authStore";
import { clearQueryCache } from "@/lib/queryClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://cloud-backend-chi.vercel.app/api";

// ── Standardized API Errors ───────────────────────────────────────────────────

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  data?: any;
  retryAfter?: number; // wait time in seconds
  /** Stable machine-readable code, e.g. EMAIL_ALREADY_REGISTERED. */
  code?: string;
  /** Flat, human-readable messages suitable for a toast. */
  errors: string[];
  /** Per-field messages suitable for inline form errors. */
  fieldErrors?: FieldErrors;

  constructor(status: number, message: string, data?: any, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.retryAfter = retryAfter;
    this.code = typeof data?.code === "string" ? data.code : undefined;
    this.errors = Array.isArray(data?.errors)
      ? data.errors.filter((item: unknown): item is string => typeof item === "string")
      : [];
    this.fieldErrors =
      data?.fieldErrors && typeof data.fieldErrors === "object"
        ? data.fieldErrors
        : undefined;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/** First inline error for a field, if the API returned one. */
export const firstFieldError = (
  error: unknown,
  field: string,
): string | undefined => {
  if (!(error instanceof ApiError) || !error.fieldErrors) return undefined;
  return error.fieldErrors[field]?.[0];
};

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized or session expired", data?: any) {
    super(401, message, data);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message: string = "Access denied: You do not have permission to perform this action.",
    data?: any
  ) {
    super(403, message, data);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class RateLimitError extends ApiError {
  retryAfter: number;

  constructor(retryAfter: number = 60, message?: string, data?: any) {
    const formatted =
      message ||
      `Rate limit exceeded. Please wait ${retryAfter} second${
        retryAfter === 1 ? "" : "s"
      } before trying again.`;
    super(429, formatted, data, retryAfter);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export const isRateLimitError = (err: unknown): err is RateLimitError => {
  return (
    err instanceof RateLimitError ||
    (err instanceof ApiError && err.status === 429)
  );
};

// Parses standard HTTP Retry-After header or backend body for 429 responses
function parseRetryAfter(res: Response, bodyData?: any): number {
  const headerVal =
    res.headers.get("retry-after") || res.headers.get("Retry-After");
  if (headerVal) {
    const parsedInt = parseInt(headerVal, 10);
    if (!isNaN(parsedInt) && parsedInt > 0) {
      return parsedInt;
    }
    const parsedDate = Date.parse(headerVal);
    if (!isNaN(parsedDate)) {
      const diffSecs = Math.ceil((parsedDate - Date.now()) / 1000);
      if (diffSecs > 0) return diffSecs;
    }
  }

  if (bodyData) {
    const bodyVal =
      bodyData.retryAfter ??
      bodyData.retry_after ??
      bodyData.data?.retryAfter ??
      bodyData.data?.retry_after;
    if (typeof bodyVal === "number" && bodyVal > 0) return bodyVal;
    if (typeof bodyVal === "string") {
      const num = parseInt(bodyVal, 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }

  return 60; // safe fallback: 60 seconds
}

// ── Refresh Queue & Fetch Client ──────────────────────────────────────────────

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
  options: RequestInit = {},
): Promise<Response> => {
  const mergedOptions: RequestInit = {
    ...options,
    credentials: "include", // Stricter CORS/cookie behavior — sends cookies across origins
  };

  let res = await fetch(url, mergedOptions);

  // Access token expired — attempt a silent refresh
  // Exclude auth routes to avoid infinite refresh loops
  const isAuthEndpoint =
    url.includes("/auth/refresh") ||
    url.includes("/auth/login") ||
    url.includes("/auth/register");

  if (res.status === 401 && !isAuthEndpoint) {
    // If a refresh is already in flight, queue this request until it resolves.
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            const retryOptions: RequestInit = {
              ...mergedOptions,
              headers: {
                ...mergedOptions.headers,
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

        if (newToken) {
          // Persist the new access token in the store
          useAuthStore.getState().setToken(newToken);

          // Unblock all queued requests with the new token
          processQueue(null, newToken);

          // Retry the original request with the fresh token
          res = await fetch(url, {
            ...mergedOptions,
            headers: {
              ...mergedOptions.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          throw new UnauthorizedError("Invalid token returned from refresh");
        }
      } else {
        const authErr = new UnauthorizedError("Session expired. Please log in again.");
        processQueue(authErr, null);
        useAuthStore.getState().logout();
        clearQueryCache();
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    } catch (err) {
      processQueue(err, null);
      useAuthStore.getState().logout();
      clearQueryCache();
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    } finally {
      isRefreshing = false;
    }
  }

  return res;
};

const getHeaders = (extraHeaders?: Record<string, string>) => {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Parses the response and throws standardized ApiError, UnauthorizedError, ForbiddenError, or RateLimitError
const handleResponse = async (res: Response) => {
  let data: any = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await res.text();
      data = text ? { message: text } : null;
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    // The backend returns `errors` (flat strings) and `fieldErrors` (per form
    // field). `error` is the legacy shape, kept so older deployments still work.
    const errors = Array.isArray(data?.errors)
      ? data.errors.filter((item: unknown): item is string => typeof item === "string")
      : Array.isArray(data?.error)
        ? data.error.filter((item: unknown): item is string => typeof item === "string")
        : [];
    const details = errors.length > 0 ? errors.join(" · ") : null;
    const baseMessage =
      data?.message || details || `Request failed with status ${res.status}`;

    if (res.status === 401) {
      throw new UnauthorizedError(baseMessage, data);
    }
    if (res.status === 403) {
      throw new ForbiddenError(baseMessage, data);
    }
    if (res.status === 429) {
      const retryAfter = parseRetryAfter(res, data);
      const retryMsg =
        data?.message ||
        `Too many requests. Please wait ${retryAfter} second${
          retryAfter === 1 ? "" : "s"
        } before retrying.`;
      throw new RateLimitError(retryAfter, retryMsg, data);
    }

    throw new ApiError(res.status, baseMessage, data);
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
  companyName?: string;
  address: string;
  houseNumber?: string;
  country: string;
  city: string;
  state: string;
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
    credentials: "include",
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
    credentials: "include",
    body: JSON.stringify(data),
  }).then(handleResponse);

/** Step 2 – submit OTP; returns { resetToken } valid for 10 min. */
export const verifyResetOTP = (data: { email: string; code: string }) =>
  fetch(`${BASE_URL}/auth/verify-reset-otp`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
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
    credentials: "include",
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
    credentials: "include",
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

export type PurchaseHostingPayload = {
  planId: string;
  domain: string;
  billingCycle: "monthly" | "quarterly" | "yearly";
};

export type PurchaseHostingResult = {
  paymentUrl: string;
  reference: string;
  total: number;
  domain: string;
};

export const purchaseHosting = (
  data: PurchaseHostingPayload,
): Promise<{ success: boolean; data: PurchaseHostingResult; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/purchase`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

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

export type RenewHostingPayload = {
  billingCycle?: "monthly" | "quarterly" | "yearly";
};

export type RenewHostingResult = {
  paymentUrl: string;
  reference: string;
  total: number;
  hostingId: string;
  domain: string;
  billingCycle: string;
};

export type UpgradeHostingPayload = {
  planId: string;
  billingCycle?: "monthly" | "quarterly" | "yearly";
};

export type UpgradeHostingResult = {
  paymentUrl: string;
  reference: string;
  total: number;
  hostingId: string;
  currentPlan: string;
  targetPlan: string;
  billingCycle: string;
};

export const renewHosting = (
  id: string,
  data?: RenewHostingPayload,
): Promise<{ success: boolean; data: RenewHostingResult; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/renew`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data ?? {}),
  }).then(handleResponse);

export const upgradeHosting = (
  id: string,
  data: UpgradeHostingPayload,
): Promise<{ success: boolean; data: UpgradeHostingResult; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/upgrade`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
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

// ── VPS Hosting ───────────────────────────────────────────────────────────────

export type VpsStatus =
  | "PROVISIONING"
  | "RUNNING"
  | "STOPPED"
  | "REBOOTING"
  | "REBUILDING"
  | "SUSPENDED"
  | "FAILED"
  | "DELETING"
  | "DELETED";

export type VpsPlan = {
  id: string;
  name: string;
  cpu: number;
  ramGb: number;
  diskGb: number;
  priceNgnMonthly: number;
};

export type VpsImage = {
  id: string;
  label: string;
  providerImage: string;
};

export type VpsLocation = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
};

export type VpsServer = {
  id: string;
  name: string;
  status: VpsStatus;
  location: string;
  image: string;
  providerServerId: string | null;
  ipv4: string | null;
  ipv6: string | null;
  plan: VpsPlan | null;
  sshKey: { id: string; name: string } | null;
  orderItemId?: string | null;
  firewallConfigured: boolean;
  nextBillingAt: string | null;
  suspendedAt: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  deletedAt: string | null;
  /** False when the last live provider sync failed; the rest is last-known state. */
  providerSynced?: boolean;
};

export type VpsActionType =
  | "CREATE"
  | "START"
  | "STOP"
  | "REBOOT"
  | "REBUILD"
  | "RESIZE"
  | "DELETE";

export type VpsActionStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";

export type VpsAction = {
  id: string;
  type: VpsActionType;
  status: VpsActionStatus;
  providerActionId: string | null;
  metadata: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type VpsActionPage = {
  items: VpsAction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type VpsServerPage = {
  items: VpsServer[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type VpsFirewallProtocol = "tcp" | "udp" | "icmp" | "esp" | "gre";

export type VpsFirewallRule = {
  direction: "in" | "out";
  protocol: VpsFirewallProtocol;
  port?: string;
  sourceIps?: string[];
  destinationIps?: string[];
  description?: string;
};

export type VpsFirewall = {
  applied: boolean;
  rules: VpsFirewallRule[];
};

export type SshKey = {
  id: string;
  name: string;
  publicKey: string;
  fingerprint: string | null;
  createdAt: string;
};

export type CreateVpsPayload = {
  planId: string;
  image: string;
  location: string;
  name: string;
  sshKeyId?: string;
  orderItemId?: string;
};

export type RenewVpsResult = {
  paymentUrl: string;
  reference: string;
  total: number;
  orderId: string;
  vpsId: string;
  nextBillingAt: string | null;
};

/** Idempotency keys must be 8–128 characters; a UUID satisfies both bounds. */
const newIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `vps-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

const idempotentHeaders = (key?: string) =>
  getHeaders({ "Idempotency-Key": key ?? newIdempotencyKey() });

export const getVpsPlans = (): Promise<{
  success: boolean;
  data: VpsPlan[];
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/vps/plans`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const getVpsImages = (): Promise<{
  success: boolean;
  data: VpsImage[];
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/vps/images`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const getVpsLocations = (): Promise<{
  success: boolean;
  data: VpsLocation[];
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/vps/locations`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const getVpsServers = (params?: {
  page?: number;
  limit?: number;
  status?: VpsStatus;
}): Promise<{
  success: boolean;
  data: VpsServerPage;
  message: string;
}> => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return fetchWithRefresh(`${BASE_URL}/vps${suffix}`, {
    headers: getHeaders(),
  }).then(handleResponse);
};

export const getVpsServer = (id: string): Promise<{
  success: boolean;
  data: VpsServer;
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const createVpsServer = (
  data: CreateVpsPayload,
  idempotencyKey?: string,
): Promise<{ success: boolean; data: VpsServer; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps`, {
    method: "POST",
    headers: idempotentHeaders(idempotencyKey),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const getVpsActions = (
  id: string,
  params?: { page?: number; limit?: number },
): Promise<{ success: boolean; data: VpsActionPage; message: string }> => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return fetchWithRefresh(
    `${BASE_URL}/vps/${encodeURIComponent(id)}/actions${suffix}`,
    { headers: getHeaders() },
  ).then(handleResponse);
};

export const renameVpsServer = (
  id: string,
  name: string,
): Promise<{ success: boolean; data: VpsServer; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ name }),
  }).then(handleResponse);

export const deleteVpsServer = (
  id: string,
  idempotencyKey?: string,
): Promise<{ success: boolean; data: { id: string; status: string }; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: idempotentHeaders(idempotencyKey),
    body: JSON.stringify({ confirm: true }),
  }).then(handleResponse);

export const startVpsServer = (
  id: string,
  idempotencyKey?: string,
): Promise<{ success: boolean; data: VpsAction; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}/start`, {
    method: "POST",
    headers: idempotentHeaders(idempotencyKey),
  }).then(handleResponse);

export const stopVpsServer = (
  id: string,
  options?: { force?: boolean; idempotencyKey?: string },
): Promise<{ success: boolean; data: VpsAction; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}/stop`, {
    method: "POST",
    headers: idempotentHeaders(options?.idempotencyKey),
    body: JSON.stringify({ force: options?.force === true }),
  }).then(handleResponse);

export const rebootVpsServer = (
  id: string,
  idempotencyKey?: string,
): Promise<{ success: boolean; data: VpsAction; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}/reboot`, {
    method: "POST",
    headers: idempotentHeaders(idempotencyKey),
  }).then(handleResponse);

export const rebuildVpsServer = (
  id: string,
  image: string,
  idempotencyKey?: string,
): Promise<{ success: boolean; data: VpsAction; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}/rebuild`, {
    method: "POST",
    headers: idempotentHeaders(idempotencyKey),
    body: JSON.stringify({ image, confirm: true }),
  }).then(handleResponse);

export const resizeVpsServer = (
  id: string,
  planId: string,
  idempotencyKey?: string,
): Promise<{ success: boolean; data: VpsAction; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}/resize`, {
    method: "POST",
    headers: idempotentHeaders(idempotencyKey),
    body: JSON.stringify({ planId }),
  }).then(handleResponse);

export const renewVpsServer = (
  id: string,
): Promise<{ success: boolean; data: RenewVpsResult; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}/renew`, {
    method: "POST",
    headers: getHeaders(),
  }).then(handleResponse);

export const getVpsFirewall = (
  id: string,
): Promise<{ success: boolean; data: VpsFirewall; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}/firewall`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const updateVpsFirewall = (
  id: string,
  rules: VpsFirewallRule[],
): Promise<{ success: boolean; data: VpsFirewall; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/${encodeURIComponent(id)}/firewall`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ rules }),
  }).then(handleResponse);

export const getSshKeys = (): Promise<{
  success: boolean;
  data: SshKey[];
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/vps/ssh-keys`, {
    headers: getHeaders(),
  }).then(handleResponse);

export const createSshKey = (data: {
  name: string;
  publicKey: string;
}): Promise<{ success: boolean; data: SshKey; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/ssh-keys`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteSshKey = (
  id: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/vps/ssh-keys/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getHeaders(),
  }).then(handleResponse);

// ── Orders ────────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type RefundStatus =
  | "NONE"
  | "REQUESTED"
  | "PROCESSING"
  | "PROCESSED"
  | "FAILED";

/** A single line-item inside an order */
export type OrderItem = {
  id: string;
  type:
    | "HOSTING"
    | "DOMAIN"
    | "SSL"
    | "DOMAIN_TRANSFER"
    | "VPS"
    | "VPS_RENEWAL";
  price: number;
  domainName?: string;
  plan?: Plan; // present for HOSTING items
  planId?: string;
  hostingAccountId?: string | null;
  vpsPlanId?: string | null;
  vpsPlan?: VpsPlan | null;
  vpsTarget?: { id: string; name: string } | null;
  vpsConfig?: {
    image: string;
    location: string;
    name?: string;
    sshKeyId?: string;
  } | null;
  /** Refund state for a paid VPS line that could not be provisioned. */
  refundStatus?: RefundStatus;
  /** Raw Paystack refund status (pending/processing/processed/failed). */
  refundProviderStatus?: string | null;
  refundAmount?: number | null;
  refundRequestedAt?: string | null;
  refundFailureReason?: string | null;
  /** Set only when Paystack reports the refund as processed. */
  refundedAt?: string | null;
  /** Present once this paid VPS line item has a server attached. */
  vps?: { id: string; status: VpsStatus } | null;
};

/** Backend cart item shapes sent to POST /orders/initialize */
export type BackendCartItem =
  | { type: "HOSTING"; planId: string; billingCycle?: "monthly" | "quarterly" | "yearly" }
  | { type: "DOMAIN"; domainName: string; extension: string }
  | { type: "DOMAIN_TRANSFER"; domainName: string; extension: string; authCode: string }
  | { type: "VPS"; planId: string; image: string; location: string; name?: string; sshKeyId?: string }
  | { type: "SSL"; domainName: string; productId?: number; period?: number; csr?: string; approverEmail?: string };

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

/** GET /orders/verify/:reference — verifies a Paystack payment with duplicate / idempotent handling */
export const verifyPayment = async (
  token?: string | null,
  reference?: string | null,
): Promise<{ success: boolean; data: VerifyPaymentResult; message: string }> => {
  if (!reference) {
    throw new Error("Payment reference is required");
  }

  try {
    const res = await fetchWithRefresh(
      `${BASE_URL}/orders/verify/${encodeURIComponent(reference)}`,
      {
        headers: getHeaders(),
      },
    );
    const data = await handleResponse(res);
    return data;
  } catch (err: any) {
    // Handle duplicate / idempotent verification responses (e.g. 409 or message indicating already processed/verified)
    const errMsg = (err?.message || "").toLowerCase();
    if (
      (err?.status === 409 || err?.status === 200) &&
      (errMsg.includes("already verified") ||
        errMsg.includes("already processed") ||
        errMsg.includes("duplicate") ||
        errMsg.includes("already completed"))
    ) {
      return {
        success: true,
        message: err.message || "Payment already verified",
        data: {
          status: "PAID",
          items: err.data?.items ?? [],
          amount: err.data?.amount ?? 0,
          reference: reference,
        },
      };
    }
    throw err;
  }
};

/** GET /orders — list all orders for the current user */
export const getOrders = (
  token: string,
): Promise<{ success: boolean; data: Order[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/orders`, {
    headers: getHeaders(),
  }).then(handleResponse);

/**
 * GET /orders/:orderId/invoice
 * Returns a JSON response with a WHMCS invoice URL for paid orders.
 */
export const getInvoiceLink = (
  orderId: string,
): Promise<{ success: boolean; data: { url: string }; message: string }> =>
  fetchWithRefresh(
    `${BASE_URL}/orders/${encodeURIComponent(orderId)}/invoice`,
    { headers: getHeaders() },
  ).then(handleResponse);

// ── Domains ───────────────────────────────────────────────────────────────────

export type DomainResult = {
  domain: string;
  available: boolean;
  isPremium: boolean;
  price: {
    price: number | null;
    currency: string | null;
  };
  renewalPrice?: {
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
    credentials: "include",
  }).then(handleResponse);

export type DomainSuggestionItem = {
  name: string;
  domain: string;
  tld: string;
};

export type SuggestDomainsPayload = {
  term: string;
  extensions?: string[];
};

/** POST /domains/suggest — suggest domain names from backend using OpenProvider */
export const suggestDomains = (
  payload: SuggestDomainsPayload,
): Promise<{ success: boolean; data: DomainSuggestionItem[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/domains/suggest`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  }).then(handleResponse);

/**
 * Extracts unique alternative domain names from suggestDomains results.
 * Ignores suggestions whose base name is identical to the searched term
 * (which are merely unsupported TLD variations like .tk, .cn, .de), returning only clean, distinct alternative names.
 */
export function extractAlternativeDomainNames(
  suggestions: DomainSuggestionItem[],
  originalTerm: string
): string[] {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return [];

  const baseClean = originalTerm
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split(".")[0]
    .replace(/[^a-z0-9-]/g, "");

  const uniqueNames: string[] = [];
  const seen = new Set<string>();

  for (const item of suggestions) {
    // The backend suggest API returns items with { name, domain, tld }
    // item.domain contains the domain name part (e.g. "BestBuyBank", "BestBuyHouses")
    const rawDomain = (item.domain || item.name?.split(".")[0] || "").trim();
    if (!rawDomain) continue;

    const lower = rawDomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

    // Skip if identical to the searched base term (these are just TLD variations like .tk, .cn, .de)
    if (lower === baseClean) continue;

    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueNames.push(rawDomain);
    }
  }

  return uniqueNames;
}


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
  validation?: SslValidationRecord[];
  createdAt: string;
  updatedAt: string;
};

export const getSSLCertificates = (
  token: string,
): Promise<{ success: boolean; data: SslCertificate[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/ssl`, {
    headers: getHeaders(),
  }).then(handleResponse);

export type SslValidationRecord = {
  host_name?: string;
  method?: string; // "dns" | "email" | "http"
  type?: string;   // e.g. "CNAME" | "TXT"
  name?: string;   // DNS record host/name
  value?: string;  // DNS record target value
  content?: string;
  record?: string;
  dns_record?: string;
  dns_type?: string;
  dns_value?: string;
  [key: string]: any;
};

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
    validation?: SslValidationRecord[];
  };
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/ssl/${encodeURIComponent(id)}/status`, {
    headers: getHeaders(),
  }).then(handleResponse);

export type SslProductPrice = {
  period: number;
  price: number;
  currency: string;
  wholesalePrice: number;
  wholesaleCurrency: string;
};

export type SslProduct = {
  id: number;
  name: string;
  category: string;
  validationMethod: string;
  deliveryTime: string;
  isWildcard: boolean;
  maxPeriod: number;
  price: number;
  currency: string;
  wholesalePrice: number;
  wholesaleCurrency: string;
  prices: SslProductPrice[];
};

export const getSSLProducts = (
  token: string,
): Promise<{ success: boolean; data: SslProduct[]; message: string }> =>
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

// ── Support Tickets ───────────────────────────────────────────────────────────

export type SupportDepartment = {
  id: string;
  name: string;
  description: string;
};

export type SupportTicketSummary = {
  id: string;
  tid: string;
  deptid: string;
  deptname: string;
  userid: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  priority: string;
  lastreply: string;
  date: string;
};

export type TicketReply = {
  id: string;
  userid: string;
  name: string;
  email: string;
  date: string;
  message: string;
  admin: string;
};

export type SupportTicketDetail = {
  id: string;
  ticketNumber: string;
  departmentId: string;
  departmentName: string;
  subject: string;
  status: string;
  priority: string;
  date: string;
  lastReply: string;
  replies: TicketReply[];
};

/** GET /support/departments — list available support departments */
export const getSupportDepartments = (): Promise<{
  success: boolean;
  data: { departments: SupportDepartment[] };
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/support/departments`, {
    headers: getHeaders(),
  }).then(handleResponse);

/** GET /support/tickets — list tickets for the current user */
export const getTickets = (
  token: string,
  params?: { status?: string; page?: number; limit?: number },
): Promise<{
  success: boolean;
  data: {
    tickets: SupportTicketSummary[];
    totalResults: number;
    page: number;
    limit: number;
  };
  message: string;
}> => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return fetchWithRefresh(
    `${BASE_URL}/support/tickets${query ? `?${query}` : ""}`,
    { headers: getHeaders() },
  ).then(handleResponse);
};

/** GET /support/tickets/:ticketId — get a single ticket with replies */
export const getTicket = (
  token: string,
  ticketId: string,
): Promise<{
  success: boolean;
  data: { ticket: SupportTicketDetail };
  message: string;
}> =>
  fetchWithRefresh(
    `${BASE_URL}/support/tickets/${encodeURIComponent(ticketId)}`,
    { headers: getHeaders() },
  ).then(handleResponse);

/** POST /support/tickets — create a new support ticket */
export const createTicket = (data: {
  deptId: string;
  subject: string;
  message: string;
  priority?: string;
  service?: string;
}): Promise<{
  success: boolean;
  data: { ticketId: string; ticketNumber: string };
  message: string;
}> =>
  fetchWithRefresh(`${BASE_URL}/support/tickets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

/** POST /support/tickets/:ticketId/reply — add a reply to a ticket */
export const replyToTicket = (
  ticketId: string,
  message: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(
    `${BASE_URL}/support/tickets/${encodeURIComponent(ticketId)}/reply`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    },
  ).then(handleResponse);

// ── Tools ─────────────────────────────────────────────────────────────────────

export interface DnsRecordSOA {
  nsname: string;
  hostmaster: string;
  serial: number;
  refresh: number;
  retry: number;
  expire: number;
  minttl: number;
}

export interface DnsRecordMX {
  exchange: string;
  priority: number;
  type?: string;
}

export interface DnsRecordsData {
  domainName: string;
  records: {
    A: string[];
    AAAA: string[];
    MX: DnsRecordMX[];
    TXT: Array<string[] | string>;
    NS: string[];
    CNAME: string[];
    SOA: DnsRecordSOA | null;
  };
}

export interface DnsLookupResponse {
  success: boolean;
  message: string;
  data: DnsRecordsData | null;
  error?: string[] | string | null;
}

/** POST /tools/dnslookup — Query DNS records for a domain */
export const lookupDns = (
  domainName: string,
): Promise<DnsLookupResponse> =>
  fetch(`${BASE_URL}/tools/dnslookup`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ domainName }),
  }).then(handleResponse);

export interface WhoisServerResult {
  server: string;
  data: Record<string, any>;
}

export interface WhoisData {
  domain: string;
  results: Record<string, any> | WhoisServerResult[];
}

export interface WhoisResponse {
  success: boolean;
  message: string;
  data: WhoisData | null;
  error?: string[] | string | null;
}

/** POST /tools/whois — WHOIS record lookup for a domain */
export const lookupWhois = (
  domainName: string,
): Promise<WhoisResponse> =>
  fetch(`${BASE_URL}/tools/whois`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ domainName }),
  }).then(handleResponse);

// ── Invoices ───────────────────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  isPaid: boolean;
  whmcsInvoiceId: number | null;
  paystackRef: string;
  createdAt: string;
  description: string;
}

/** GET /invoices — fetch all invoices for authenticated user */
export const getInvoices = (): Promise<{ success: boolean; data: Invoice[]; message?: string }> =>
  fetchWithRefresh(`${BASE_URL}/invoices`, {
    headers: getHeaders(),
  }).then(handleResponse);

export interface PayOrderResponse {
  paymentUrl: string;
  reference: string;
  orderId: string;
  amount: number;
}

/** POST /orders/:orderId/pay — initialize payment for pending or failed order/invoice */
export const payOrder = (
  orderId: string,
): Promise<{ success: boolean; data: PayOrderResponse; message?: string }> =>
  fetchWithRefresh(`${BASE_URL}/orders/${encodeURIComponent(orderId)}/pay`, {
    method: "POST",
    headers: getHeaders(),
  }).then(handleResponse);

export interface OrderInvoiceResponse {
  url?: string;
  redirectUrl?: string;
}

/** GET /orders/:orderId/invoice — get PDF/view URL for paid invoice */
export const getOrderInvoice = (
  orderId: string,
): Promise<{ success: boolean; data?: OrderInvoiceResponse; url?: string; redirectUrl?: string; message?: string }> =>
  fetchWithRefresh(`${BASE_URL}/orders/${encodeURIComponent(orderId)}/invoice`, {
    headers: getHeaders(),
  }).then(handleResponse);

// ── Expiry Warnings & Notifications ──────────────────────────────────────────

export interface ExpiryWarning {
  type: "HOSTING" | "DOMAIN";
  id: string;
  label: string;
  status: string;
  expiresAt: string | null;
  daysLeft: number | null;
  isExpired: boolean;
}

export interface ExpiryWarningsResponse {
  count: number;
  warnings: ExpiryWarning[];
}

/** GET /notifications/expiry-warnings — fetch expiry warnings for domains and hosting */
export const getExpiryWarnings = (): Promise<{ success: boolean; data: ExpiryWarningsResponse } | ExpiryWarningsResponse> =>
  fetchWithRefresh(`${BASE_URL}/notifications/expiry-warnings`, {
    headers: getHeaders(),
  }).then(handleResponse);

// ── Domain Renewal ─────────────────────────────────────────────────────────────

export interface RenewDomainResponse {
  paymentUrl: string;
  reference: string;
  total: number;
}

/** POST /domains/:id/renew — initialize renewal payment for a registered domain */
export const renewDomain = (
  id: string,
): Promise<{ success: boolean; data: RenewDomainResponse; message?: string }> =>
  fetchWithRefresh(`${BASE_URL}/domains/${encodeURIComponent(id)}/renew`, {
    method: "POST",
    headers: getHeaders(),
  }).then(handleResponse);

