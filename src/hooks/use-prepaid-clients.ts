
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PrepaidClient } from "@/lib/types";

export const usePrepaidClients = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["prepaid_clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prepaid_clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching prepaid clients:", error);
        throw error;
      }

      return (data || []) as PrepaidClient[];
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
  });

  const createPrepaidClient = useMutation({
    mutationFn: async (newClient: Omit<PrepaidClient, 'id' | 'created_at'>) => {
      // Make sure agent_id is passed correctly
      if (!newClient.agent_id) {
        throw new Error("Agent ID is required");
      }
      
      const { data, error } = await supabase
        .from("prepaid_clients")
        .insert(newClient)
        .select();

      if (error) {
        console.error("Error creating prepaid client:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prepaid_clients"] });
    },
  });

  return { 
    ...query, 
    createPrepaidClient,
    total: query.data?.reduce((sum, client) => sum + client.amount, 0) || 0
  };
};
