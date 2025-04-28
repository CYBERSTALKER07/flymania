
import { useState } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { useAgents } from "@/hooks/use-agents";
import { format, subDays } from "date-fns";
import { FileSpreadsheet, Users, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentMetricsCard } from "@/components/performance/AgentMetricsCard";
import { PerformanceCharts } from "@/components/performance/PerformanceCharts";
import { useToast } from "@/hooks/use-toast";
import { exportOperatorPerformanceToExcel } from "@/lib/excel-export";

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#83a6ed', '#8dd1e1'];

// Define the agent stats type
interface AgentStats {
  id: string;
  name: string;
  totalCount: number;
  totalRevenue: number;
  flightCount: number;
  tourCount: number;
  insuranceCount: number;
  seatCount: number;
  baggageCount: number;
  avgTicketPrice: number;
}

export default function OperatorPerformance() {
  const [timeRange, setTimeRange] = useState("month");
  const { data: tickets = [], isLoading: isLoadingTickets } = useTickets();
  const { data: agents = [], isLoading: isLoadingAgents } = useAgents();
  const { toast } = useToast();

  // Get date range based on selected timeRange
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "week": return { start: subDays(now, 7), end: now };
      case "month": return { start: subDays(now, 30), end: now };
      case "quarter": return { start: subDays(now, 90), end: now };
      case "year": return { start: subDays(now, 365), end: now };
      default: return { start: subDays(now, 30), end: now };
    }
  };

  const dateRange = getDateRange();
  const filteredTickets = tickets.filter(ticket => {
    const ticketDate = new Date(ticket.issueDate);
    return ticketDate >= dateRange.start && ticketDate <= dateRange.end;
  });

  // Calculate operator statistics
  const operatorStats: AgentStats[] = agents.map(agent => {
    const agentTickets = filteredTickets.filter(t => t.agentId === agent.id);
    const totalCount = agentTickets.length;
    const totalRevenue = agentTickets.reduce((sum, t) => sum + t.price, 0);
    
    return {
      id: agent.id,
      name: agent.name,
      totalCount,
      totalRevenue,
      flightCount: agentTickets.filter(t => !t.serviceType || t.serviceType === 'flight').length,
      tourCount: agentTickets.filter(t => t.serviceType === 'tour').length,
      insuranceCount: agentTickets.filter(t => t.serviceType === 'insurance').length,
      seatCount: agentTickets.filter(t => t.serviceType === 'seat').length,
      baggageCount: agentTickets.filter(t => t.serviceType === 'baggage').length,
      avgTicketPrice: totalCount ? totalRevenue / totalCount : 0
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Prepare data for charts
  const pieChartData = operatorStats.map(stat => ({
    name: stat.name,
    value: stat.totalRevenue
  }));

  const barChartData = operatorStats.map(stat => ({
    name: stat.name,
    flights: stat.flightCount,
    tours: stat.tourCount,
    insurance: stat.insuranceCount,
    seats: stat.seatCount,
    baggage: stat.baggageCount
  }));

  // Handle export to Excel
  const handleExportToExcel = () => {
    try {
      exportOperatorPerformanceToExcel(operatorStats, 'operator-performance');
      toast({
        title: "Отчет успешно экспортирован",
        description: "Файл Excel с данными об эффективности операторов сохранен на ваш компьютер",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Ошибка при экспорте",
        description: "Не удалось создать отчет. Пожалуйста, попробуйте еще раз.",
        variant: "destructive"
      });
    }
  };

  if (isLoadingTickets || isLoadingAgents) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка данных о работе операторов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Эффективность операторов</h1>
          <p className="text-muted-foreground">
            Статистика и показатели производительности операторов
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Выберите период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Последние 7 дней</SelectItem>
              <SelectItem value="month">Последние 30 дней</SelectItem>
              <SelectItem value="quarter">Последние 90 дней</SelectItem>
              <SelectItem value="year">Последние 12 месяцев</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleExportToExcel} 
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Экспорт в Excel
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {operatorStats.slice(0, 3).map((operator, index) => (
          <AgentMetricsCard key={operator.id} agent={operator} rank={index + 1} />
        ))}
      </div>
      
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Таблица
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Графики
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Рейтинг операторов</CardTitle>
              <CardDescription>
                Сравнительная таблица показателей работы всех операторов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Рейтинг</th>
                      <th className="text-left py-3 px-4">Оператор</th>
                      <th className="text-center py-3 px-4">Авиабилеты</th>
                      <th className="text-center py-3 px-4">Туры</th>
                      <th className="text-center py-3 px-4">Страховки</th>
                      <th className="text-center py-3 px-4">Места</th>
                      <th className="text-center py-3 px-4">Багаж</th>
                      <th className="text-center py-3 px-4">Всего продаж</th>
                      <th className="text-right py-3 px-4">Выручка</th>
                      <th className="text-right py-3 px-4">Средняя цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatorStats.map((operator, index) => (
                      <tr key={operator.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div>{operator.name}</div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">{operator.flightCount}</td>
                        <td className="text-center py-3 px-4">{operator.tourCount}</td>
                        <td className="text-center py-3 px-4">{operator.insuranceCount}</td>
                        <td className="text-center py-3 px-4">{operator.seatCount}</td>
                        <td className="text-center py-3 px-4">{operator.baggageCount}</td>
                        <td className="text-center py-3 px-4">{operator.totalCount}</td>
                        <td className="text-right py-3 px-4">
                          {new Intl.NumberFormat('ru-RU', {
                            style: 'currency',
                            currency: 'RUB',
                            maximumFractionDigits: 0,
                          }).format(operator.totalRevenue)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {new Intl.NumberFormat('ru-RU', {
                            style: 'currency',
                            currency: 'RUB',
                            maximumFractionDigits: 0,
                          }).format(operator.avgTicketPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts">
          <PerformanceCharts 
            pieChartData={pieChartData}
            barChartData={barChartData}
            colors={COLORS}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
