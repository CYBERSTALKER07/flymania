
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
import { useConsumptions } from '@/hooks/use-consumptions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Wallet } from 'lucide-react';

const consumptionSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  payment_method: z.enum(['cash', 'bank_transfer', 'visa', 'uzcard', 'terminal']),
  commentary: z.string().optional()
});

const ConsumptionsPage: React.FC = () => {
  const { 
    consumptions, 
    isLoading, 
    fetchConsumptions, 
    addConsumption, 
    calculateTotalConsumptions,
    exportConsumptionsToExcel
  } = useConsumptions();

  const form = useForm<z.infer<typeof consumptionSchema>>({
    resolver: zodResolver(consumptionSchema),
    defaultValues: {
      amount: 0,
      payment_method: 'cash',
      commentary: ''
    }
  });

  useEffect(() => {
    fetchConsumptions();
  }, []);

  const onSubmit = (data: z.infer<typeof consumptionSchema>) => {
    const consumptionData = {
      amount: data.amount,
      payment_method: data.payment_method,
      commentary: data.commentary || undefined
    };
    
    addConsumption(consumptionData);
    form.reset();
  };

  const totalConsumptions = calculateTotalConsumptions();

  const handleExport = () => {
    exportConsumptionsToExcel();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Consumptions" 
          value={totalConsumptions} 
          icon={Wallet}
          iconColor="#4CAF50"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add Consumption</CardTitle>
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
                <Button type="submit" className="w-full">Add Consumption</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Consumption History</CardTitle>
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
                {consumptions.map((consumption) => (
                  <TableRow key={consumption.id}>
                    <TableCell>{consumption.amount}</TableCell>
                    <TableCell>{consumption.payment_method}</TableCell>
                    <TableCell>{consumption.commentary || '-'}</TableCell>
                    <TableCell>
                      {new Date(consumption.created_at || '').toLocaleDateString()}
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

export default ConsumptionsPage;
