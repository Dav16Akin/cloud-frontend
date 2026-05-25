import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyOTP,
  resendOTP,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// ── Login ─────────────────────────────────────────────────────────────────────

export const useLogin = () => {
  const setToken = useAuthStore((s) => s.setToken);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => loginUser(data),
    onSuccess: (res) => {
      // Handle different backend response shapes
      const token = res?.token ?? res?.data?.token ?? res?.accessToken;
      if (token) {
        setToken(token);
      }
      toast.success("Welcome back!");
      router.push("/dashboard"); // Always redirect on a successful (2xx) login
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Register ──────────────────────────────────────────────────────────────────

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
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
    }) => registerUser(data),
    onSuccess: (_res, variables) => {
      toast.success("Account created! Check your email for the verification code.");
      router.push(`/verify?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Verify OTP ────────────────────────────────────────────────────────────────

export const useVerifyOTP = () => {
  const setToken = useAuthStore((s) => s.setToken);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; code: string }) => verifyOTP(data),
    onSuccess: (res) => {
      if (res?.token) {
        setToken(res.token);
      }
      toast.success("Email verified! You can now log in.");
      router.push("/login");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Resend OTP ────────────────────────────────────────────────────────────────

export const useResendOTP = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => resendOTP(data),
    onSuccess: () => {
      toast.success("A new code has been sent to your email.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Logout ────────────────────────────────────────────────────────────────────

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSettled: () => {
      logout();
      queryClient.clear();
      router.push("/login");
    },
  });
};
