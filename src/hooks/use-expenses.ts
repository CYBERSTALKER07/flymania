
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { exportExpensesToExcel } from '@/lib/excel-export';
import { Expense } from '@/lib/types';

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExpenses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch expenses', { description: error.message });
      setIsLoading(false);
      return;
    }

    setExpenses(data || []);
    setIsLoading(false);
  };

  const addExpense = async (expense: Expense) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from('expenses')
      .insert({ 
        ...expense, 
        user_id: user.id 
      });

    if (error) {
      toast.error('Failed to add expense', { description: error.message });
      setIsLoading(false);
      return;
    }

    toast.success('Expense added successfully');
    await fetchExpenses();
    setIsLoading(false);
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return {
    expenses,
    isLoading,
    fetchExpenses,
    addExpense,
    calculateTotalExpenses,
    exportExpensesToExcel: () => exportExpensesToExcel(expenses)
  };
};
