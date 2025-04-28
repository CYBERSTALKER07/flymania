
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

interface PerformanceChartsProps {
  pieChartData: Array<{ name: string; value: number }>;
  barChartData: Array<{
    name: string;
    flights: number;
    tours: number;
    insurance: number;
    seats: number;
    baggage: number;
  }>;
  colors: string[];
}

export const PerformanceCharts = ({ pieChartData, barChartData, colors }: PerformanceChartsProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md p-3 shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes("Revenue") 
                ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Распределение выручки по операторам</CardTitle>
          <CardDescription>Доля каждого оператора в общей выручке за выбранный период</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Структура продаж по типам услуг</CardTitle>
          <CardDescription>Сравнение количества продаж разных типов услуг по операторам</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="flights" name="Авиабилеты" stackId="a" fill={colors[0]} />
                <Bar dataKey="tours" name="Туры" stackId="a" fill={colors[1]} />
                <Bar dataKey="insurance" name="Страховки" stackId="a" fill={colors[2]} />
                <Bar dataKey="seats" name="Места" stackId="a" fill={colors[3]} />
                <Bar dataKey="baggage" name="Багаж" stackId="a" fill={colors[4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
