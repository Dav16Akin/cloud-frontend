import { useAuthStore } from "@/store/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    throw new Error(details || data?.message || `Request failed (${res.status})`);
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

// ── Protected (pass token) ────────────────────────────────────────────────────

export const getMe = (token: string) =>
  fetch(`${BASE_URL}/auth/me`, {
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
  }
) =>
  fetch(`${BASE_URL}/user/profile`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const changePassword = (
  token: string,
  data: { currentPassword: string; newPassword: string }
) =>
  fetch(`${BASE_URL}/user/change-password`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  }).then(handleResponse);
