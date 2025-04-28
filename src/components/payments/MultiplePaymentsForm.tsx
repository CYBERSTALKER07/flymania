
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { PaymentData, PaymentMethodType } from "@/hooks/use-ticket-payment";
import { Payment } from "@/lib/types";

const paymentSchema = z.object({
  cashAmount: z.number().min(0, "Amount cannot be negative").optional(),
  cardAmount: z.number().min(0, "Amount cannot be negative").optional(),
  terminalAmount: z.number().min(0, "Amount cannot be negative").optional(),
  transferAmount: z.number().min(0, "Amount cannot be negative").optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface MultiplePaymentsFormProps {
  totalAmount: number;
  onSubmit?: (data: { payments: PaymentData[] }) => void;
  isSubmitting?: boolean;
  initialPayments?: Payment[];
  onChange: (paymentData: { payments: PaymentData[] }) => void;
}

export function MultiplePaymentsForm({ 
  totalAmount, 
  onSubmit, 
  isSubmitting = false,
  initialPayments = [],
  onChange
}: MultiplePaymentsFormProps) {
  const [totalPaid, setTotalPaid] = useState(0);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cashAmount: undefined,
      cardAmount: undefined,
      terminalAmount: undefined,
      transferAmount: undefined,
    },
  });

  // Calculate existing payments if any
  const existingPaymentsTotal = initialPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

  // Set initial values if provided
  useEffect(() => {
    if (initialPayments && initialPayments.length > 0) {
      const newValues: PaymentFormValues = {
        cashAmount: undefined,
        cardAmount: undefined,
        terminalAmount: undefined,
        transferAmount: undefined
      };
      
      initialPayments.forEach(payment => {
        switch (payment.paymentMethod as PaymentMethodType) {
          case 'cash':
            newValues.cashAmount = (newValues.cashAmount || 0) + payment.amount;
            break;
          case 'bank_transfer':
            newValues.cardAmount = (newValues.cardAmount || 0) + payment.amount;
            break;
          case 'terminal':
            newValues.terminalAmount = (newValues.terminalAmount || 0) + payment.amount;
            break;
          case 'visa':
          case 'uzcard':
            newValues.transferAmount = (newValues.transferAmount || 0) + payment.amount;
            break;
        }
      });
      
      form.reset(newValues);
    }
  }, [initialPayments, form]);

  const watchValues = form.watch();
  
  // Update total and notify parent of changes
  useEffect(() => {
    const cash = watchValues.cashAmount || 0;
    const card = watchValues.cardAmount || 0;
    const terminal = watchValues.terminalAmount || 0;
    const transfer = watchValues.transferAmount || 0;
    
    const sum = cash + card + terminal + transfer;
    setTotalPaid(sum);

    const payments: PaymentData[] = [];
    
    if (cash > 0) {
      payments.push({ amount: cash, paymentMethod: "cash" });
    }
    if (card > 0) {
      payments.push({ amount: card, paymentMethod: "bank_transfer" });
    }
    if (terminal > 0) {
      payments.push({ amount: terminal, paymentMethod: "terminal" });
    }
    if (transfer > 0) {
      payments.push({ amount: transfer, paymentMethod: "visa" });
    }

    onChange({ payments });
  }, [watchValues, onChange]);

  const remaining = totalAmount - existingPaymentsTotal - totalPaid;

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="flex justify-between mb-4">
          <div>Полная сумма: <span className="font-bold">{totalAmount.toLocaleString()} UZS</span></div>
          <div>Остаток: <span className={`font-bold ${remaining !== 0 ? 'text-red-500' : 'text-green-500'}`}>
            {remaining.toLocaleString()} UZS
          </span></div>
        </div>

        {existingPaymentsTotal > 0 && (
          <div className="mb-4">
            <p>Уже оплачено: <span className="font-medium">{existingPaymentsTotal.toLocaleString()} UZS</span></p>
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="cashAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>НАЛИЧНЫЕ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Введите сумму"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>НА КАРТУ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Введите сумму"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="terminalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ТЕРМИНАЛ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Введите сумму"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="transferAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ПЕРЕЧИСЛЕНИЕ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Введите сумму"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}
