
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type PaymentMethodType = 'cash' | 'bank_transfer' | 'terminal' | 'visa' | 'uzcard';

export type PaymentData = {
  amount: number;
  paymentMethod: PaymentMethodType;
};

export interface UseTicketPaymentProps {
  onSuccess?: () => void;
  refetchTickets?: () => Promise<any>;
}

export function useTicketPayment({ onSuccess, refetchTickets }: UseTicketPaymentProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payments, setPayments] = useState<PaymentData[]>([]);

  const handlePaymentsChange = (paymentData: {payments: PaymentData[]}) => {
    setPayments(paymentData.payments);
    return paymentData.payments;
  };

  const getPaymentStatus = (totalPrice: number, amountPaid: number): 'pending' | 'paid' => {
    return Math.abs(amountPaid - totalPrice) < 1 ? 'paid' : 'pending';
  };

  const handlePaymentSubmit = async (
    ticketId: string, 
    ticketPrice: number, 
    newPayments: PaymentData[] = []
  ) => {
    if (!ticketId) {
      toast({
        title: "Ошибка",
        description: "ID билета не найден",
        variant: "destructive",
      });
      return { success: false };
    }
    
    try {
      setIsSubmitting(true);
      console.log("Processing payments for ticket:", ticketId);
      console.log("New payment data:", newPayments);
      
      if (newPayments.length === 0) {
        toast({
          title: "Ошибка",
          description: "Введите хотя бы одну сумму оплаты",
          variant: "destructive",
        });
        return { success: false };
      }

      // First, get the current ticket to calculate the total paid amount
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('price, paid_amount')
        .eq('id', ticketId)
        .single();
        
      if (ticketError) {
        console.error("Error fetching ticket:", ticketError);
        throw ticketError;
      }
      
      // Calculate the new total paid amount
      let newTotalPaid = 0;
      
      // Insert all new payments
      for (const payment of newPayments) {
        const { error: paymentError } = await supabase
          .from('ticket_payments')
          .insert({
            ticket_id: ticketId,
            amount: payment.amount,
            payment_method: payment.paymentMethod,
          });
          
        if (paymentError) {
          console.error("Payment insertion error:", paymentError);
          throw paymentError;
        }
        newTotalPaid += payment.amount;
      }
      
      // Add existing paid amount to new payments
      const currentPaidAmount = ticketData?.paid_amount || 0;
      const fullTotalPaid = currentPaidAmount + newTotalPaid;
      
      // Calculate payment status
      const paymentStatus = getPaymentStatus(ticketPrice, fullTotalPaid);
      
      // Update ticket status - FIXED: Removed remaining_amount from the update
      const { error: ticketUpdateError } = await supabase
        .from('tickets')
        .update({
          payment_status: paymentStatus,
          payment_date: paymentStatus === 'paid' ? new Date().toISOString() : null,
          paid_amount: fullTotalPaid
        })
        .eq('id', ticketId);
        
      if (ticketUpdateError) {
        console.error("Ticket update error:", ticketUpdateError);
        throw ticketUpdateError;
      }
      
      if (refetchTickets) {
        await refetchTickets();
      }
      
      toast({
        title: paymentStatus === 'paid' ? "Платеж завершен" : "Частичная оплата сохранена",
        description: paymentStatus === 'paid' 
          ? "Билет отмечен как полностью оплаченный" 
          : `Остаток к оплате: ${(ticketPrice - fullTotalPaid).toLocaleString()} UZS`,
      });

      if (onSuccess) {
        onSuccess();
      }

      return { 
        success: true, 
        paymentStatus,
        paidAmount: fullTotalPaid
      };
    } catch (error: any) {
      console.error("Error in payment submission:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить информацию о платеже: " + error.message,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
      setPayments([]);
    }
  };

  return {
    isSubmitting,
    payments,
    handlePaymentsChange,
    handlePaymentSubmit,
    getPaymentStatus,
  };
}
