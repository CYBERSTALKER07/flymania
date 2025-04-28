import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plane, Mountain, FileText, WalletCards } from "lucide-react";

export function ServiceTypeSelection() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Выберите тип услуги</h1>
        <p className="text-muted-foreground mt-2">
          Выберите, какую услугу вы хотите продать
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('tickets')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Авиабилеты</CardTitle>
              <CardDescription>Продажа билетов разных типов</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('tours')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mountain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Туры</CardTitle>
              <CardDescription>Туристические поездки и пакеты</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('additional-services')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Дополнительные услуги</CardTitle>
              <CardDescription>Страховка, места в салоне, багаж</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('unpaid-payments')}
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

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('paid-payments')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Оплаченные билеты</CardTitle>
              <CardDescription>Просмотр истории оплаченных билетов</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('prepaid')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <WalletCards className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Предоплаты</CardTitle>
              <CardDescription>Управление предоплатами клиентов</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
