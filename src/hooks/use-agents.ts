
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Agent } from "@/lib/types";

export const useAgents = () => {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching agents:", error);
        throw error;
      }

      return (data || []) as Agent[];
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
