
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function TicketTypeSelection() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Выберите тип билета</h1>
        <p className="text-muted-foreground mt-2">
          Выберите тип билета, который вы хотите продать
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('one-way')}
        >
          <CardHeader>
            <CardTitle>В одну сторону</CardTitle>
            <CardDescription>Билет в одном направлении</CardDescription>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('round-trip')}
        >
          <CardHeader>
            <CardTitle>Туда и обратно</CardTitle>
            <CardDescription>Билет в обоих направлениях</CardDescription>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('multi-city')}
        >
          <CardHeader>
            <CardTitle>Составной маршрут</CardTitle>
            <CardDescription>Билет с несколькими остановками</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
