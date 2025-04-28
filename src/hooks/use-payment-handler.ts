
import { useState } from "react";
import { Ticket, Payment } from "@/lib/types";
import { useTicketPayment, PaymentData } from "@/hooks/use-ticket-payment";
import { toast } from "@/hooks/use-toast";

export function usePaymentHandler(refetch: () => Promise<any>) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const { 
    isSubmitting, 
    handlePaymentSubmit: processPayment,
    handlePaymentsChange
  } = useTicketPayment({
    refetchTickets: refetch,
    onSuccess: () => {
      setIsPaymentDialogOpen(false);
      toast({
        title: "Успешно",
        description: "Информация о платеже обновлена",
      });
    }
  });

  const handleTicketPaymentSubmit = async (data: {payments: PaymentData[]}) => {
    if (!selectedTicket) {
      toast({
        title: "Ошибка",
        description: "Не выбран билет для оплаты",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Processing payment for ticket:", selectedTicket.id);
      console.log("Payment data:", data.payments);
      
      if (!data.payments || data.payments.length === 0) {
        toast({
          title: "Ошибка",
          description: "Введите хотя бы одну сумму оплаты",
          variant: "destructive",
        });
        return;
      }
      
      const existingPayments = selectedTicket.payments || [];
      
      // Process the payment with both new and existing payment data
      await processPayment(
        selectedTicket.id,
        selectedTicket.price,
        data.payments
      );

      await refetch(); // Refresh ticket data after successful payment
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обработать платеж",
        variant: "destructive",
      });
    }
  };

  return {
    selectedTicket,
    setSelectedTicket,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isSubmitting,
    handlePaymentSubmit: handleTicketPaymentSubmit
  };
}
