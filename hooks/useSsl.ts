import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSSLCertificates,
  getSSLStatus,
  getSSLProducts,
  downloadSSLCertificateFile,
  type SslCertificate,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export const useGetSslCertificates = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["ssl-certificates"],
    queryFn: async () => {
      if (!token) return [];
      try {
        const res = await getSSLCertificates(token);
        return res?.data || [];
      } catch (err) {
        console.error("Failed to fetch SSL certificates:", err);
        return [];
      }
    },
    enabled: !!token,
    staleTime: 30 * 1000,
  });
};

export const useGetSslCertificateDetails = (id: string) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["ssl-certificate", id],
    queryFn: async () => {
      if (!token || !id) return null;
      try {
        const res = await getSSLStatus(token, id);
        return res?.data || null;
      } catch (err) {
        console.error("Failed to fetch SSL certificate status:", err);
        try {
          const all = await getSSLCertificates(token);
          const found = (all?.data || []).find(
            (c) => c.id === id || c.domainName === id
          );
          return found || null;
        } catch {
          return null;
        }
      }
    },
    enabled: !!token && !!id,
    staleTime: 30 * 1000,
  });
};

export const useGetSslStatus = () => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("Not authenticated");
      return getSSLStatus(token, id);
    },
    onSuccess: (res) => {
      toast.success(res.message || "SSL certificate status updated.");
      queryClient.invalidateQueries({ queryKey: ["ssl-certificates"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update SSL status.");
    },
  });
};

export const useGetSslProducts = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["ssl-products"],
    queryFn: async () => {
      if (!token) return [];
      try {
        const res = await getSSLProducts(token);
        return res?.data || [];
      } catch (err) {
        console.error("Failed to fetch SSL products:", err);
        return [];
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDownloadSslCertificate = () => {
  return useMutation({
    mutationFn: async ({ id, domainName }: { id: string; domainName?: string }) => {
      const blob = await downloadSSLCertificateFile(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${domainName || id || "certificate"}.crt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    },
    onSuccess: () => {
      toast.success("Certificate file downloaded successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to download SSL certificate.");
    },
  });
};
