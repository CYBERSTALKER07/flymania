
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Ticket } from "@/lib/types";
import { exportTicketsToExcel } from "@/lib/excel-export";
import { toast } from "@/hooks/use-toast";

interface PaidTicketsListProps {
  tickets: Ticket[];
}

export function PaidTicketsList({ tickets }: PaidTicketsListProps) {
  const handleExport = () => {
    exportTicketsToExcel(tickets, 'paid-tickets');
    toast({
      title: "Экспорт выполнен",
      description: "Файл с оплаченными билетами скачан",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Оплаченные билеты и услуги</CardTitle>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Экспорт в Excel
        </Button>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет оплаченных билетов
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Оператор</TableHead>
                <TableHead>Услуга</TableHead>
                <TableHead>Маршрут/Сервис</TableHead>
                <TableHead>Цена (UZS)</TableHead>
                <TableHead>Способ оплаты</TableHead>
                <TableHead>Дата оплаты</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.passengerName}</TableCell>
                  <TableCell>{ticket.agentName}</TableCell>
                  <TableCell>{ticket.serviceType || "Билет"}</TableCell>
                  <TableCell>
                    {ticket.origin?.city} - {ticket.destination?.city}
                  </TableCell>
                  <TableCell>{ticket.price.toLocaleString()}</TableCell>
                  <TableCell>
                    {ticket.paymentMethod === 'cash' && 'Наличные'}
                    {ticket.paymentMethod === 'bank_transfer' && 'Банковский перевод'}
                    {ticket.paymentMethod === 'visa' && 'Visa'}
                    {ticket.paymentMethod === 'uzcard' && 'UzCard'}
                  </TableCell>
                  <TableCell>
                    {ticket.paymentDate ? new Date(ticket.paymentDate).toLocaleDateString() : '-'}
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
