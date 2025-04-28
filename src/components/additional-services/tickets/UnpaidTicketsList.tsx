
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Ticket } from "@/lib/types";
import { exportTicketsToExcel } from "@/lib/excel-export";
import { toast } from "@/hooks/use-toast";

interface UnpaidTicketsListProps {
  tickets: Ticket[];
  onEditPayment: (ticket: Ticket) => void;
}

export function UnpaidTicketsList({ tickets, onEditPayment }: UnpaidTicketsListProps) {
  const handleExport = () => {
    exportTicketsToExcel(tickets, 'unpaid-tickets');
    toast({
      title: "Экспорт выполнен",
      description: "Файл с неоплаченными билетами скачан",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Неоплаченные билеты и услуги</CardTitle>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Экспорт в Excel
        </Button>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет неоплаченных билетов
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Оператор</TableHead>
                <TableHead>Услуга</TableHead>
                <TableHead>Маршрут/Сервис</TableHead>
                <TableHead>Полная стоимость</TableHead>
                <TableHead>Остаток</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Действия</TableHead>
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
                  <TableCell>{ticket.originalPrice?.toLocaleString() || ticket.price.toLocaleString()} UZS</TableCell>
                  <TableCell className="font-medium text-red-500">{ticket.price.toLocaleString()} UZS</TableCell>
                  <TableCell>{new Date(ticket.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => onEditPayment(ticket)}>
                      Редактировать оплату
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
