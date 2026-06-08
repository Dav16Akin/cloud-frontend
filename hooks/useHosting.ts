import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getHosting,
  getHostingById,
  provisionHosting,
  deleteHosting,
  suspendHosting,
  unsuspendHosting,
  getHostingStats,
  getHostingEmails,
  createHostingEmail,
  deleteHostingEmail,
  changeHostingEmailPassword,
  getHostingForwarders,
  createHostingForwarder,
  deleteHostingForwarder,
  getHostingDatabases,
  createHostingDatabase,
  deleteHostingDatabase,
  getHostingDatabaseUsers,
  createHostingDatabaseUser,
  deleteHostingDatabaseUser,
  assignHostingDatabaseUser,
  type ProvisionHostingPayload,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// ── List all hosting accounts ─────────────────────────────────────────────────

export const useGetHosting = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["hosting"],
    queryFn: () => getHosting(token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data,
  });
};

// ── Get a single hosting account ─────────────────────────────────────────────

export const useGetHostingById = (id: string) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["hosting", id],
    queryFn: () => getHostingById(token!, id),
    enabled: !!token && !!id,
    staleTime: 60 * 1000,
    select: (res) => res.data,
  });
};

// ── Provision a new hosting account ──────────────────────────────────────────

export const useProvisionHosting = () => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProvisionHostingPayload) =>
      provisionHosting(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hosting"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Delete / terminate a hosting account ─────────────────────────────────────

export const useDeleteHosting = () => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHosting(token!, id),
    onSuccess: () => {
      toast.success("Hosting account terminated.");
      queryClient.invalidateQueries({ queryKey: ["hosting"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Suspend a hosting account ─────────────────────────────────────────────────

export const useSuspendHosting = () => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suspendHosting(token!, id),
    onSuccess: (_data, id) => {
      toast.success("Hosting account suspended.");
      queryClient.invalidateQueries({ queryKey: ["hosting"] });
      queryClient.invalidateQueries({ queryKey: ["hosting", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Unsuspend a hosting account ───────────────────────────────────────────────

export const useUnsuspendHosting = () => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unsuspendHosting(token!, id),
    onSuccess: (_data, id) => {
      toast.success("Hosting account reactivated.");
      queryClient.invalidateQueries({ queryKey: ["hosting"] });
      queryClient.invalidateQueries({ queryKey: ["hosting", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Fetch stats for a single hosting account ──────────────────────────────────

export const useGetHostingStats = (id: string | null) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["hosting-stats", id],
    queryFn: () => getHostingStats(token!, id!),
    enabled: !!token && !!id,
    staleTime: 60 * 1000,
    select: (res) => res.data,
  });
};

// ── Email accounts ────────────────────────────────────────────────────────────

export const useGetHostingEmails = (id: string) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["hosting-emails", id],
    queryFn: () => getHostingEmails(token!, id),
    enabled: !!token && !!id,
    staleTime: 60 * 1000,
    select: (res) => res.data,
  });
};

export const useCreateHostingEmail = (id: string) => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      createHostingEmail(token!, id, data),
    onSuccess: () => {
      toast.success("Email account created.");
      queryClient.invalidateQueries({ queryKey: ["hosting-emails", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export const useDeleteHostingEmail = (id: string) => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => deleteHostingEmail(token!, id, email),
    onSuccess: () => {
      toast.success("Email account deleted.");
      queryClient.invalidateQueries({ queryKey: ["hosting-emails", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export const useChangeHostingEmailPassword = (id: string) => {
  const token = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      changeHostingEmailPassword(token!, id, email, password),
    onSuccess: () => {
      toast.success("Email password changed.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Email forwarders ──────────────────────────────────────────────────────────

export const useGetHostingForwarders = (id: string) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["hosting-forwarders", id],
    queryFn: () => getHostingForwarders(token!, id),
    enabled: !!token && !!id,
    staleTime: 60 * 1000,
    // Response shape: { success, data: { status, data: [...forwarders] } }
    // Our API wrapper gives res.data = the cPanel object, so the array is at res.data.data
    select: (res) => (res.data as unknown as { data: import("@/lib/api").HostingForwarder[] }).data ?? [],
  });
};

export const useCreateHostingForwarder = (id: string) => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { source: string; destination: string }) =>
      createHostingForwarder(token!, id, data),
    onSuccess: () => {
      toast.success("Forwarder created.");
      queryClient.invalidateQueries({ queryKey: ["hosting-forwarders", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export const useDeleteHostingForwarder = (id: string) => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ address, forwarder }: { address: string; forwarder: string }) =>
      deleteHostingForwarder(token!, id, address, forwarder),
    onSuccess: () => {
      toast.success("Forwarder deleted.");
      queryClient.invalidateQueries({ queryKey: ["hosting-forwarders", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Hosting Databases ──────────────────────────────────────────────────────────

export const useGetHostingDatabases = (id: string) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["hosting-databases", id],
    queryFn: () => getHostingDatabases(token!, id),
    enabled: !!token && !!id,
    staleTime: 60 * 1000,
    select: (res) => res.data,
  });
};

export const useCreateHostingDatabase = (id: string) => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { database: string }) =>
      createHostingDatabase(token!, id, data),
    onSuccess: () => {
      toast.success("Database created.");
      queryClient.invalidateQueries({ queryKey: ["hosting-databases", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export const useDeleteHostingDatabase = (id: string) => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (database: string) => deleteHostingDatabase(token!, id, database),
    onSuccess: () => {
      toast.success("Database deleted.");
      queryClient.invalidateQueries({ queryKey: ["hosting-databases", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export const useGetHostingDatabaseUsers = (id: string) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["hosting-database-users", id],
    queryFn: () => getHostingDatabaseUsers(token!, id),
    enabled: !!token && !!id,
    staleTime: 60 * 1000,
    select: (res) => res.data,
  });
};

export const useCreateHostingDatabaseUser = (id: string) => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { user: string; password?: string }) =>
      createHostingDatabaseUser(token!, id, data),
    onSuccess: () => {
      toast.success("Database user created.");
      queryClient.invalidateQueries({ queryKey: ["hosting-database-users", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export const useDeleteHostingDatabaseUser = (id: string) => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: string) => deleteHostingDatabaseUser(token!, id, user),
    onSuccess: () => {
      toast.success("Database user deleted.");
      queryClient.invalidateQueries({ queryKey: ["hosting-database-users", id] });
      queryClient.invalidateQueries({ queryKey: ["hosting-databases", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export const useAssignHostingDatabaseUser = (id: string) => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { database: string; user: string; privileges?: string[] }) =>
      assignHostingDatabaseUser(token!, id, data),
    onSuccess: () => {
      toast.success("User assigned to database successfully.");
      queryClient.invalidateQueries({ queryKey: ["hosting-databases", id] });
      queryClient.invalidateQueries({ queryKey: ["hosting-database-users", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

