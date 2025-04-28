
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface UnpaidSummaryCardProps {
  total: number;
}

export function UnpaidSummaryCard({ total }: UnpaidSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Общая сумма неоплаченных билетов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{total.toLocaleString()} UZS</div>
      </CardContent>
    </Card>
  );
}
