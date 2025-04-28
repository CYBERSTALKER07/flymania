
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Luggage, Hotel } from "lucide-react";

export function TourTypeSelection() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Выберите тип тура</h1>
        <p className="text-muted-foreground mt-2">
          Выберите тип тура для оформления
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('package')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Luggage className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Турпакет</CardTitle>
              <CardDescription>Стандартный пакетный тур</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('custom')}
        >
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Hotel className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Индивидуальный</CardTitle>
              <CardDescription>Индивидуальный тур с раздельными поставщиками</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
