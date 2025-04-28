import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/hooks/use-tickets";
import { usePrepaidClients } from "@/hooks/use-prepaid-clients";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Ticket } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { PaymentEditDialog } from "./dialogs/PaymentEditDialog";
import { PrepaidClientDialog } from "./dialogs/PrepaidClientDialog";
import { UnpaidTicketsList } from "./tickets/UnpaidTicketsList";
import { PaidTicketsList } from "./tickets/PaidTicketsList";
import { PrepaidClientsList } from "./prepaid/PrepaidClientsList";

export function PendingPayments() {
  const { user } = useAuth();
  const { 
    data: tickets = [], 
    isLoading: isTicketsLoading, 
    refetch: refetchTickets 
  } = useTickets();
  const { 
    data: prepaidClients = [], 
    isLoading: isPrepaidClientsLoading, 
    createPrepaidClient, 
    total: prepaidClientsTotal 
  } = usePrepaidClients();
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPrepaidDialogOpen, setIsPrepaidDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unpaid");

  const unpaidTickets = tickets.filter(ticket => ticket.paymentStatus === 'pending');
  const paidTickets = tickets.filter(ticket => ticket.paymentStatus === 'paid');
  const unpaidTotal = unpaidTickets.reduce((sum, ticket) => sum + ticket.price, 0);

  const handleEditPayment = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async (data: any) => {
    if (!selectedTicket) return;
    
    const amountPaid = parseFloat(data.amountPaid);
    const fullPayment = amountPaid >= selectedTicket.price;
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          payment_status: fullPayment ? 'paid' : 'pending',
          payment_method: data.paymentMethod,
          payment_date: fullPayment ? new Date().toISOString() : null,
          price: fullPayment ? selectedTicket.price : selectedTicket.price - amountPaid,
        })
        .eq('id', selectedTicket.id);
        
      if (error) throw error;
      
      setIsPaymentDialogOpen(false);
      
      await refetchTickets();
      
      toast({
        title: fullPayment ? "Платеж завершен" : "Частичная оплата сохранена",
        description: fullPayment 
          ? "Билет отмечен как полностью оплаченный" 
          : `Остаток к оплате: ${(selectedTicket.price - amountPaid).toLocaleString()} UZS`,
      });
      
      if (fullPayment) {
        setActiveTab("paid");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить информацию о платеже",
        variant: "destructive",
      });
    }
  };

  const handlePrepaidSubmit = async (data: any) => {
    if (!user) return;

    try {
      await createPrepaidClient.mutateAsync({
        agent_id: user.id,
        agent_name: user.email || '',
        client_name: data.client_name,
        amount: parseFloat(data.amount),
        payment_date: new Date().toISOString(),
        payment_method: data.payment_method,
        notes: data.notes,
      });

      toast({
        title: "Клиент добавлен",
        description: `Предоплата для ${data.client_name} зарегистрирована`,
      });

      setIsPrepaidDialogOpen(false);
    } catch (error) {
      console.error("Error adding prepaid client:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить клиента",
        variant: "destructive",
      });
    }
  };

  const handleRemoveClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('prepaid_clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Клиент удален",
        description: "Предоплата была успешно удалена",
      });
    } catch (error) {
      console.error("Error removing client:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить клиента",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Управление платежами</h1>
        <p className="text-muted-foreground mt-2">
          Просмотр и управление неоплаченными билетами и предоплатами
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Общая сумма неоплаченных билетов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unpaidTotal.toLocaleString()} UZS</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Общая сумма предоплат</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{prepaidClientsTotal.toLocaleString()} UZS</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="unpaid">Неоплаченные ({unpaidTickets.length})</TabsTrigger>
          <TabsTrigger value="paid">Оплаченные ({paidTickets.length})</TabsTrigger>
          <TabsTrigger value="prepaid">Предоплаты ({prepaidClients.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="unpaid">
          {isTicketsLoading ? (
            <div className="flex justify-center p-4">Загрузка...</div>
          ) : (
            <UnpaidTicketsList 
              tickets={unpaidTickets} 
              onEditPayment={handleEditPayment}
            />
          )}
        </TabsContent>
        
        <TabsContent value="paid">
          {isTicketsLoading ? (
            <div className="flex justify-center p-4">Загрузка...</div>
          ) : (
            <PaidTicketsList tickets={paidTickets} />
          )}
        </TabsContent>

        <TabsContent value="prepaid">
          {isPrepaidClientsLoading ? (
            <div className="flex justify-center p-4">Загрузка...</div>
          ) : (
            <PrepaidClientsList
              clients={prepaidClients}
              onAddPrepaid={() => setIsPrepaidDialogOpen(true)}
              onRemoveClient={handleRemoveClient}
            />
          )}
        </TabsContent>
      </Tabs>

      <PaymentEditDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        selectedTicket={selectedTicket}
        onSubmit={handlePaymentSubmit}
      />

      <PrepaidClientDialog
        isOpen={isPrepaidDialogOpen}
        onClose={() => setIsPrepaidDialogOpen(false)}
        onSubmit={handlePrepaidSubmit}
      />
    </div>
  );
}
