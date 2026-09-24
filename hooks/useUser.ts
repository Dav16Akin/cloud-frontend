import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateProfile, changePassword } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  companyName?: string;
  houseNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  verified?: boolean;
  createdAt?: string;
}

export interface MeResponse {
  success: boolean;
  message?: string;
  data: UserProfile;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  companyName?: string;
  address?: string;
  country?: string;
  city?: string;
  state?: string;
  houseNumber?: string;
  postcode?: string;
}

export const useGetMe = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: () => getMe(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserPayload) => updateProfile(token!, data),
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export const useChangePassword = () => {
  const token = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      changePassword(token!, data),
    onSuccess: () => {
      toast.success("Password changed successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};
