import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Train, Shield, FileText, Clock } from "lucide-react";

export function AdditionalServicesSelection() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Дополнительные услуги</h1>
        <p className="text-muted-foreground mt-2">
          Выберите тип дополнительной услуги для оформления
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('train')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Train className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Ж/Д билет</CardTitle>
              <CardDescription>Оформление железнодорожных билетов</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('insurance')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Страховка</CardTitle>
              <CardDescription>Оформление страховых полисов</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('other')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Другие услуги</CardTitle>
              <CardDescription>Оформление дополнительных услуг</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('pending-payments')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Неоплаченные счета</CardTitle>
              <CardDescription>Управление платежами</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
