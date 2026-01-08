import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AttemptInput } from "@shared/routes";

export function useAttempts() {
  return useQuery({
    queryKey: [api.attempts.list.path],
    queryFn: async () => {
      const res = await fetch(api.attempts.list.path);
      if (!res.ok) throw new Error("Failed to fetch attempts");
      return api.attempts.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AttemptInput) => {
      const res = await fetch(api.attempts.create.path, {
        method: api.attempts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit attempt");
      }
      
      return api.attempts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attempts.list.path] });
    },
  });
}
