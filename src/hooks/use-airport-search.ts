
import { useState, useEffect } from "react";
import { useAirports } from "./use-airports";
import type { Airport } from "@/lib/types";

interface UseAirportSearchProps {
  query: string;
  limit?: number;
}

export const useAirportSearch = ({ query, limit = 5 }: UseAirportSearchProps) => {
  const { data: airports = [], isLoading, error } = useAirports();
  const [results, setResults] = useState<Airport[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const normalizedQuery = query.toUpperCase().trim();
    
    const filtered = airports
      .filter(airport => 
        airport.iataCode.includes(normalizedQuery) ||
        airport.city.toUpperCase().includes(normalizedQuery) ||
        airport.name.toUpperCase().includes(normalizedQuery)
      )
      .slice(0, limit);

    setResults(filtered);
  }, [query, airports, limit]);

  return {
    results,
    isLoading,
    error,
  };
};
