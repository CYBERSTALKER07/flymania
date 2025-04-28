
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { Airport } from "@/lib/types";

interface AirportSearchInputProps {
  value: string;
  onChange: (airport: Airport) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  error?: boolean;
}

export function AirportSearchInput({
  value,
  onChange,
  onInputChange,
  placeholder = "Search airports...",
  id,
  error
}: AirportSearchInputProps) {
  const [inputValue, setInputValue] = useState(value || "");

  // Initialize input value from provided value
  useEffect(() => {
    if (value && !inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit to 3 characters
    const newValue = e.target.value.toUpperCase().slice(0, 3);
    setInputValue(newValue);
    
    if (onInputChange) {
      onInputChange(newValue);
    }
    
    // Create a minimal Airport object with the IATA code
    if (newValue.length === 3) {
      const airport: Airport = {
        iataCode: newValue,
        city: "Unknown City", // Default values for unknown airports
        name: "Unknown Airport",
        country: "Unknown Country"
      };
      
      onChange(airport);
    }
  };

  return (
    <Input
      id={id}
      value={inputValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={`${error ? 'border-red-500' : ''}`}
      maxLength={3}
    />
  );
}
