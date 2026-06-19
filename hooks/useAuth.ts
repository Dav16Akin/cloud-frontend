import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// ── Login ─────────────────────────────────────────────────────────────────────

export const useLogin = (redirectTo = "/dashboard") => {
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
      router.push(redirectTo); // Respect redirect param (e.g. /cart/checkout)
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

// ── Forgot Password (Step 1) ──────────────────────────────────────────────────

export const useForgotPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string }) => forgotPassword(data),
    onSuccess: (_res, variables) => {
      toast.success("A reset code has been sent to your email.");
      // Persist email in sessionStorage as fallback for the OTP page
      sessionStorage.setItem("reset_email", variables.email);
      router.push(
        `/verify-reset-otp?email=${encodeURIComponent(variables.email)}`
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Verify Reset OTP (Step 2) ─────────────────────────────────────────────────

export const useVerifyResetOTP = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; code: string }) =>
      verifyResetOTP(data),
    onSuccess: (res) => {
      const resetToken =
        res?.resetToken ?? res?.data?.resetToken ?? res?.token ?? "";
      sessionStorage.removeItem("reset_email");
      toast.success("Code verified! Set your new password.");
      router.push(`/reset-password?resetToken=${encodeURIComponent(resetToken)}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Reset Password (Step 3) ───────────────────────────────────────────────────

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { resetToken: string; newPassword: string }) =>
      resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successfully! You can now log in.");
      router.push("/login");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};
