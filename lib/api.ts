import { useAuthStore } from "@/store/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "cloud-backend-chi.vercel.app/api";

// lib/api.ts
const fetchWithRefresh = async (url: string, options: RequestInit) => {
  let res = await fetch(url, options);

  // if token expired
  if (res.status === 401) {
    // try to get a new access token
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends the refresh token cookie
    });

    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();

      // save new token to Zustand
      useAuthStore.getState().setToken(accessToken);

      // retry original request with new token
      const retryOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      };
      res = await fetch(url, retryOptions);
    } else {
      // refresh token also expired → force logout
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
  }

  return res;
};

const getHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

// Parses the response and throws an Error with the backend message on non-2xx.
// Handles both simple { message } and Zod-style { message, error: string[] } shapes.
const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().logout();
    }
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
  country: string;
  city: string;
  postcode: string;
}) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const loginUser = (data: { email: string; password: string }) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
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
    body: JSON.stringify(data),
  }).then(handleResponse);

export const resendOTP = (data: { email: string }) =>
  fetch(`${BASE_URL}/auth/resend`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ── Protected (auto-refresh token) ───────────────────────────────────────────

export const getMe = (token: string) =>
  fetchWithRefresh(`${BASE_URL}/auth/me`, {
    headers: getHeaders(token),
  }).then(handleResponse);

export const updateProfile = (
  token: string,
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    companyName?: string;
    address?: string;
    country?: string;
    city?: string;
    postcode?: string;
  },
) =>
  fetchWithRefresh(`${BASE_URL}/users/profile`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const changePassword = (
  token: string,
  data: { oldPassword: string; newPassword: string },
) =>
  fetchWithRefresh(`${BASE_URL}/users/change-password`, {
    method: "PATCH",
    headers: getHeaders(token),
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
    headers: getHeaders(token),
  }).then(handleResponse);

export const getHostingById = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingAccount; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}`, {
    headers: getHeaders(token),
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
    headers: getHeaders(token),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteHosting = (
  token: string,
  id: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  }).then(handleResponse);

export const suspendHosting = (
  token: string,
  id: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/suspend`, {
    method: "POST",
    headers: getHeaders(token),
  }).then(handleResponse);

export const unsuspendHosting = (
  token: string,
  id: string,
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/unsuspend`, {
    method: "POST",
    headers: getHeaders(token),
  }).then(handleResponse);

export const getHostingStats = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingStats; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/stats`, {
    headers: getHeaders(token),
  }).then(handleResponse);

// ── Hosting Emails ─────────────────────────────────────────────────────────────

export const getHostingEmails = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingEmail[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/emails`, {
    headers: getHeaders(token),
  }).then(handleResponse);

export const createHostingEmail = (
  token: string,
  id: string,
  data: { email: string; password: string },
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/emails`, {
    method: "POST",
    headers: getHeaders(token),
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
      headers: getHeaders(token),
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
      headers: getHeaders(token),
      body: JSON.stringify({ password }),
    },
  ).then(handleResponse);

// ── Hosting Email Forwarders ───────────────────────────────────────────────────

export const getHostingForwarders = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingForwarder[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/emails/forwarders`, {
    headers: getHeaders(token),
  }).then(handleResponse);

export const createHostingForwarder = (
  token: string,
  id: string,
  data: { source: string; destination: string },
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/emails/forwarders`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteHostingForwarder = (
  token: string,
  id: string,
  address: string,   // source email on the domain  e.g. no-reply@demobusiness.com
  forwarder: string, // destination email            e.g. akindav16@gmail.com
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(
    `${BASE_URL}/hosting/${id}/emails/forwarders?address=${encodeURIComponent(address)}&forwarder=${encodeURIComponent(forwarder)}`,
    {
      method: "DELETE",
      headers: getHeaders(token),
    },
  ).then(handleResponse);

// ── Hosting Databases ──────────────────────────────────────────────────────────

export const getHostingDatabases = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingDatabase[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/databases`, {
    headers: getHeaders(token),
  }).then(handleResponse);

export const createHostingDatabase = (
  token: string,
  id: string,
  data: { database: string },
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/databases`, {
    method: "POST",
    headers: getHeaders(token),
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
      headers: getHeaders(token),
    },
  ).then(handleResponse);

export const getHostingDatabaseUsers = (
  token: string,
  id: string,
): Promise<{ success: boolean; data: HostingDatabaseUser[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/databases/users`, {
    headers: getHeaders(token),
  }).then(handleResponse);

export const createHostingDatabaseUser = (
  token: string,
  id: string,
  data: { user: string; password?: string },
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/databases/users`, {
    method: "POST",
    headers: getHeaders(token),
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
      headers: getHeaders(token),
    },
  ).then(handleResponse);

export const assignHostingDatabaseUser = (
  token: string,
  id: string,
  data: { database: string; user: string; privileges?: string[] },
): Promise<{ success: boolean; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/hosting/${id}/databases/users/assign`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ── Orders ────────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PAID" | "FAILED";

export type Order = {
  id: string;
  planId: string;
  amount: number;
  status: OrderStatus;
  paystackRef: string;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
};

export type InitializePaymentResult = {
  paymentUrl: string;
  reference: string;
};

export type VerifyPaymentResult = {
  status: OrderStatus;
  plan: Plan;
  amount: number;
  reference: string;
};

/** POST /orders/initialize — creates a Paystack checkout session */
export const initializePayment = (
  token: string,
  data: { planId: string },
): Promise<{ success: boolean; data: InitializePaymentResult; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/orders/initialize`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  }).then(handleResponse);

/** GET /orders/verify/:reference — verifies a Paystack payment */
export const verifyPayment = (
  token: string,
  reference: string,
): Promise<{ success: boolean; data: VerifyPaymentResult; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/orders/verify/${encodeURIComponent(reference)}`, {
    headers: getHeaders(token),
  }).then(handleResponse);

/** GET /orders — list all orders for the current user */
export const getOrders = (
  token: string,
): Promise<{ success: boolean; data: Order[]; message: string }> =>
  fetchWithRefresh(`${BASE_URL}/orders`, {
    headers: getHeaders(token),
  }).then(handleResponse);
