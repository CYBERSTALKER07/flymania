
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useExpenses } from '@/hooks/use-expenses';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Wallet } from 'lucide-react';

const expenseSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  payment_method: z.enum(['cash', 'bank_transfer', 'visa', 'uzcard', 'terminal']),
  commentary: z.string().optional()
});

const ExpensesPage: React.FC = () => {
  const { 
    expenses, 
    isLoading, 
    fetchExpenses, 
    addExpense, 
    calculateTotalExpenses, 
    exportExpensesToExcel 
  } = useExpenses();

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      payment_method: 'cash',
      commentary: ''
    }
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const onSubmit = (data: z.infer<typeof expenseSchema>) => {
    const expenseData = {
      amount: data.amount,
      payment_method: data.payment_method,
      commentary: data.commentary || undefined
    };
    
    addExpense(expenseData);
    form.reset();
  };

  const totalExpenses = calculateTotalExpenses();

  const handleExport = () => {
    exportExpensesToExcel();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Expenses" 
          value={totalExpenses} 
          icon={Wallet}
          iconColor="#FF6B6B"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="visa">Visa</SelectItem>
                          <SelectItem value="uzcard">Uzcard</SelectItem>
                          <SelectItem value="terminal">Terminal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="commentary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentary (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Add Expense</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Expense History</CardTitle>
            <Button onClick={handleExport}>Export to Excel</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Commentary</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.amount}</TableCell>
                    <TableCell>{expense.payment_method}</TableCell>
                    <TableCell>{expense.commentary || '-'}</TableCell>
                    <TableCell>
                      {new Date(expense.created_at || '').toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpensesPage;
