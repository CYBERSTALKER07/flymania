import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PrepaidClient } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Download, Plus, Trash } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PrepaidClientsListProps {
  clients: PrepaidClient[];
  onAddPrepaid: () => void;
  onRemoveClient: (clientId: string) => void;
}

export function PrepaidClientsList({ clients, onAddPrepaid, onRemoveClient }: PrepaidClientsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Предоплаты клиентов</CardTitle>
        <Button onClick={onAddPrepaid} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Добавить предоплату
        </Button>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет предоплат
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Оператор</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Способ оплаты</TableHead>
                <TableHead>Дата оплаты</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.client_name}</TableCell>
                  <TableCell>{client.agent_name}</TableCell>
                  <TableCell>{formatCurrency(client.amount)}</TableCell>
                  <TableCell>
                    {client.payment_method === 'cash' && 'Наличные'}
                    {client.payment_method === 'bank_transfer' && 'Банковский перевод'}
                    {client.payment_method === 'visa' && 'Visa'}
                    {client.payment_method === 'uzcard' && 'UzCard'}
                  </TableCell>
                  <TableCell>{new Date(client.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemoveClient(client.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
