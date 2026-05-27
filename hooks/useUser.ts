import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateProfile, changePassword } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const useGetMe = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      companyName?: string;
      address?: string;
      country?: string;
      city?: string;
      postcode?: string;
    }) => updateProfile(token!, data),
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
