import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSupportDepartments,
  getTickets,
  getTicket,
  createTicket,
  replyToTicket,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// ── Departments ───────────────────────────────────────────────────────────────

export const useGetDepartments = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["support-departments"],
    queryFn: () => getSupportDepartments(),
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 min — rarely changes
    select: (res) => res.data.departments,
  });
};

// ── Ticket List ───────────────────────────────────────────────────────────────

export const useGetTickets = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["support-tickets", params],
    queryFn: () => getTickets(token!, params),
    enabled: !!token,
    staleTime: 30 * 1000,
    select: (res) => res.data,
  });
};

// ── Single Ticket ─────────────────────────────────────────────────────────────

export const useGetTicket = (ticketId: string | null) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["support-ticket", ticketId],
    queryFn: () => getTicket(token!, ticketId!),
    enabled: !!token && !!ticketId,
    staleTime: 15 * 1000,
    select: (res) => res.data.ticket,
  });
};

// ── Create Ticket ─────────────────────────────────────────────────────────────

export const useCreateTicket = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { deptId: string; subject: string; message: string }) =>
      createTicket(data),
    onSuccess: () => {
      toast.success("Ticket created successfully");
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create ticket");
    },
  });
};

// ── Reply to Ticket ───────────────────────────────────────────────────────────

export const useReplyToTicket = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      replyToTicket(ticketId, message),
    onSuccess: (_data, variables) => {
      toast.success("Reply sent");
      qc.invalidateQueries({
        queryKey: ["support-ticket", variables.ticketId],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send reply");
    },
  });
};
