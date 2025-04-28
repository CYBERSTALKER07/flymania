
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTickets } from "@/hooks/use-tickets";
import { PaidTicketsList } from "../tickets/PaidTicketsList";

export function PaidPayments() {
  const { data: tickets = [], isLoading } = useTickets();

  // Add debugging to check what tickets we're getting
  console.log("All tickets in PaidPayments:", tickets);
  
  // Make sure we're using the correct property name for filtering
  const paidTickets = tickets.filter(ticket => ticket.paymentStatus === 'paid');
  console.log("Filtered paid tickets:", paidTickets);
  
  const paidTotal = paidTickets.reduce((sum, ticket) => sum + ticket.price, 0);

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Оплаченные платежи</h1>
        <p className="text-muted-foreground mt-2">
          Просмотр оплаченных билетов и услуг
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Общая сумма оплаченных билетов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paidTotal.toLocaleString()} UZS</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-green-50 p-4 rounded-md mb-4 text-sm">
        <p>Диагностическая информация:</p>
        <p>Всего билетов: {tickets.length}</p>
        <p>Оплаченных билетов: {paidTickets.length}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">Загрузка...</div>
      ) : (
        paidTickets.length > 0 ? (
          <PaidTicketsList tickets={paidTickets} />
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-600">Нет оплаченных билетов</p>
          </div>
        )
      )}
    </div>
  );
}
