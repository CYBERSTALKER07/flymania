
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function PendingPaymentsCard() {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate('/sell-ticket/pending-payments')}
    >
      <CardHeader className="space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle>Неоплаченные билеты</CardTitle>
          <CardDescription>Просмотр и обновление статуса оплаты билетов</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
