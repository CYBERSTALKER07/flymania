
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Airline } from "@/lib/types";

export const useAirlines = () => {
  return useQuery({
    queryKey: ["airlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("airlines")
        .select("*")
        .order("name");

      if (error) throw error;
      
      // Transform the database schema to match our application types
      return (data || []).map(airline => ({
        name: airline.name,
        iataCode: airline.iata_code,
        country: airline.country
      })) as Airline[];
    }
  });
};
