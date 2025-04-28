
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { usePrepaidClients } from "@/hooks/use-prepaid-clients";
import { PrepaidClientDialog } from "../dialogs/PrepaidClientDialog";
import { PrepaidClientsList } from "./PrepaidClientsList";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function PrepaidPayments() {
  const { user } = useAuth();
  const { data: prepaidClients = [], isLoading, createPrepaidClient, total: prepaidClientsTotal } = usePrepaidClients();
  const [isPrepaidDialogOpen, setIsPrepaidDialogOpen] = useState(false);

  const handlePrepaidSubmit = async (data: any) => {
    try {
      if (!user?.id) {
        toast({
          title: "Ошибка",
          description: "Необходимо авторизоваться для добавления клиента",
          variant: "destructive",
        });
        return;
      }
      
      await createPrepaidClient.mutateAsync({
        ...data,
        agent_id: user.id,
        agent_name: user.email || '',
        amount: parseFloat(data.amount),
        payment_date: new Date().toISOString(),
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
        <h1 className="text-3xl font-bold">Управление предоплатами</h1>
        <p className="text-muted-foreground mt-2">
          Просмотр и управление предоплатами клиентов
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Общая сумма предоплат</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{prepaidClientsTotal.toLocaleString()} UZS</div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center p-4">Загрузка...</div>
      ) : (
        <PrepaidClientsList
          clients={prepaidClients}
          onAddPrepaid={() => setIsPrepaidDialogOpen(true)}
          onRemoveClient={handleRemoveClient}
        />
      )}

      <PrepaidClientDialog
        isOpen={isPrepaidDialogOpen}
        onClose={() => setIsPrepaidDialogOpen(false)}
        onSubmit={handlePrepaidSubmit}
      />
    </div>
  );
}
