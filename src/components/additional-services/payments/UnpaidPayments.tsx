import React from "react";
import { useTickets } from "@/hooks/use-tickets";
import { PaymentEditDialog } from "../dialogs/PaymentEditDialog";
import { UnpaidTicketsList } from "../tickets/UnpaidTicketsList";
import { usePaymentHandler } from "@/hooks/use-payment-handler";
import { UnpaidSummaryCard } from "./UnpaidSummaryCard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function UnpaidPayments() {
  const { user } = useAuth();
  const { data: tickets = [], isLoading, refetch } = useTickets();
  const {
    selectedTicket,
    setSelectedTicket,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isSubmitting,
    handlePaymentSubmit
  } = usePaymentHandler(refetch);

  // Modified filtering to only include tickets with pending payment status
  const unpaidTickets = tickets
    .filter(ticket => ticket.paymentStatus === 'pending')
    .map(ticket => {
      // Calculate remaining amount
      const ticketPayments = ticket.payments || [];
      const totalPaid = ticketPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = ticket.price - totalPaid;
      
      return {
        ...ticket,
        originalPrice: ticket.price,
        price: remainingAmount
      };
    });
  
  const unpaidTotal = unpaidTickets.reduce((sum, ticket) => sum + ticket.price, 0);

  const handleEditPayment = (ticket) => {
    try {
      // Find the original ticket with all payment information
      const originalTicket = tickets.find(t => t.id === ticket.id);
      
      if (originalTicket) {
        setSelectedTicket(originalTicket);
        setIsPaymentDialogOpen(true);
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось найти данные билета",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error selecting ticket for editing:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при выборе билета",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Неоплаченные платежи</h1>
        <p className="text-muted-foreground mt-2">
          Управление неоплаченными билетами и услугами
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <UnpaidSummaryCard total={unpaidTotal} />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">Загрузка...</div>
      ) : (
        unpaidTickets.length > 0 ? (
          <UnpaidTicketsList 
            tickets={unpaidTickets} 
            onEditPayment={handleEditPayment}
          />
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-600">Нет неоплаченных билетов</p>
          </div>
        )
      )}

      <PaymentEditDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        selectedTicket={selectedTicket}
        onSubmit={handlePaymentSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
