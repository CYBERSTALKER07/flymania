
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { exportConsumptionsToExcel } from '@/lib/excel-export';
import { Consumption } from '@/lib/types';

export const useConsumptions = () => {
  const { user } = useAuth();
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConsumptions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('consumptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch consumptions', { description: error.message });
      setIsLoading(false);
      return;
    }

    setConsumptions(data || []);
    setIsLoading(false);
  };

  const addConsumption = async (consumption: Consumption) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from('consumptions')
      .insert({ 
        ...consumption, 
        user_id: user.id 
      });

    if (error) {
      toast.error('Failed to add consumption', { description: error.message });
      setIsLoading(false);
      return;
    }

    toast.success('Consumption added successfully');
    await fetchConsumptions();
    setIsLoading(false);
  };

  const calculateTotalConsumptions = () => {
    return consumptions.reduce((total, consumption) => total + consumption.amount, 0);
  };

  return {
    consumptions,
    isLoading,
    fetchConsumptions,
    addConsumption,
    calculateTotalConsumptions,
    exportConsumptionsToExcel: () => exportConsumptionsToExcel(consumptions)
  };
};
