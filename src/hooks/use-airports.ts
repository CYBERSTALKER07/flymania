
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Airport } from "@/lib/types";

export const useAirports = () => {
  return useQuery({
    queryKey: ["airports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("airports")
        .select("*")
        .order("city");

      if (error) throw error;
      
      // Transform the database schema to match our application types
      return (data || []).map(airport => ({
        name: airport.name,
        city: airport.city,
        country: airport.country,
        iataCode: airport.iata_code
      })) as Airport[];
    }
  });
};
