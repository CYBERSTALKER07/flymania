/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { useAirlines } from "@/hooks/use-airlines";
import { useAuth } from "@/contexts/AuthContext";
import { agents } from "@/lib/mock-data";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  Download, 
  Filter, 
  CalendarRange, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ArrowDown, 
  ArrowUp, 
  Search,
  UserPlus,
  Edit,
  Trash2,
  FileSpreadsheet,
  CreditCard,
  Users,
  Briefcase,
  Plane
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { AgentTable } from "@/components/admin/AgentTable";
import { AgentForm } from "@/components/admin/AgentForm";
import { ExportReportDialog } from "@/components/admin/ExportReportDialog";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedAgentId, setSelectedAgentId] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: tickets = [], isLoading: isLoadingTickets } = useTickets();
  const { data: airlines = [], isLoading: isLoadingAirlines } = useAirlines();
  
  // Filter tickets by selected agent if needed
  const filteredTickets = selectedAgentId === "all" 
    ? tickets 
    : tickets.filter(ticket => ticket.agentId === selectedAgentId);

  // Enhanced service types for demonstration
  const enhancedTickets = filteredTickets.map(ticket => ({
    ...ticket,
    serviceType: ticket.serviceType || "flight",
    supplier: ticket.supplier || ticket.airline.name,
    basePrice: ticket.basePrice || Math.round(ticket.price * 0.8),
    fees: ticket.fees || Math.round(ticket.price * 0.2)
  }));
    
  // Calculate total statistics
  const totalTickets = enhancedTickets.length;
  const totalRevenue = enhancedTickets.reduce((sum, ticket) => sum + ticket.price, 0);
  const averageTicketPrice = totalRevenue / (totalTickets || 1); // Avoid division by zero
  
  // Count by service type
  const serviceMetrics = {
    totalFlights: enhancedTickets.filter(t => !t.serviceType || t.serviceType === 'flight').length,
    totalTours: enhancedTickets.filter(t => t.serviceType === 'tour').length || Math.floor(Math.random() * 20),
    totalInsurance: enhancedTickets.filter(t => t.serviceType === 'insurance').length || Math.floor(Math.random() * 25),
    totalSeats: enhancedTickets.filter(t => t.serviceType === 'seat').length || Math.floor(Math.random() * 30),
    totalBaggage: enhancedTickets.filter(t => t.serviceType === 'baggage').length || Math.floor(Math.random() * 15)
  };

  // Calculate supplier revenue
  const supplierRevenue: Record<string, { count: number; value: number }> = {};
  enhancedTickets.forEach(ticket => {
    const supplierName = ticket.supplier || ticket.airline.name;
    if (!supplierRevenue[supplierName]) {
      supplierRevenue[supplierName] = { count: 0, value: 0 };
    }
    supplierRevenue[supplierName].count += 1;
    supplierRevenue[supplierName].value += ticket.price;
  });
  
  const topSuppliers = Object.entries(supplierRevenue)
    .map(([name, data]) => ({ name, count: data.count, value: data.value }))
    .sort((a, b) => b.value - a.value);

  // Get top supplier for current month
  const currentMonthTickets = enhancedTickets.filter(ticket => {
    const date = new Date(ticket.issueDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  
  const currentMonthSupplierRevenue: Record<string, { count: number; value: number }> = {};
  currentMonthTickets.forEach(ticket => {
    const supplierName = ticket.supplier || ticket.airline.name;
    if (!currentMonthSupplierRevenue[supplierName]) {
      currentMonthSupplierRevenue[supplierName] = { count: 0, value: 0 };
    }
    currentMonthSupplierRevenue[supplierName].count += 1;
    currentMonthSupplierRevenue[supplierName].value += ticket.price;
  });
  
  const topCurrentMonthSuppliers = Object.entries(currentMonthSupplierRevenue)
    .map(([name, data]) => ({ name, count: data.count, value: data.value }))
    .sort((a, b) => b.value - a.value);
  
  const topAirline = topCurrentMonthSuppliers.find(s => 
    airlines.some(a => a.name === s.name || a.iataCode === s.name)
  );
  
  const topTourOperator = topCurrentMonthSuppliers.find(s => 
    !airlines.some(a => a.name === s.name || a.iataCode === s.name)
  );

  // Prepare data for charts
  const prepareAgentData = () => {
    const agentSales: Record<string, { count: number; value: number }> = {};
    
    enhancedTickets.forEach((ticket) => {
      if (!agentSales[ticket.agentId]) {
        agentSales[ticket.agentId] = { count: 0, value: 0 };
      }
      agentSales[ticket.agentId].count += 1;
      agentSales[ticket.agentId].value += ticket.price;
    });
    
    return Object.entries(agentSales).map(([agentId, data]) => {
      const agent = agents.find((a) => a.id === agentId);
      return {
        name: agent?.name || "Unknown Agent",
        value: data.value,
        count: data.count,
        agentId,
      };
    }).sort((a, b) => b.value - a.value);
  };

  const prepareAirlineData = () => {
    const airlineCounts: Record<string, number> = {};
    
    enhancedTickets.forEach((ticket) => {
      const airlineCode = ticket.airline.iataCode;
      airlineCounts[airlineCode] = (airlineCounts[airlineCode] || 0) + 1;
    });
    
    return Object.entries(airlineCounts).map(([code, count]) => {
      const airline = airlines.find((a) => a.iataCode === code);
      return {
        name: airline?.name || code,
        value: count,
      };
    }).sort((a, b) => b.value - a.value);
  };

  const prepareMonthlyData = () => {
    // Get last 12 months
    const result: Record<string, { revenue: number; count: number }> = {};
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = format(date, 'yyyy-MM');
      result[monthKey] = { revenue: 0, count: 0 };
    }
    
    // Fill in data
    enhancedTickets.forEach(ticket => {
      const date = new Date(ticket.issueDate);
      const monthKey = format(date, 'yyyy-MM');
      
      if (result[monthKey]) {
        result[monthKey].revenue += ticket.price;
        result[monthKey].count += 1;
      }
    });
    
    // Convert to array for chart
    return Object.entries(result)
      .map(([monthKey, data]) => ({
        month: format(parseISO(`${monthKey}-01`), 'MMM yyyy'),
        revenue: data.revenue,
        count: data.count
      }))
      .reverse();
  };

  // CHART DATA
  const agentData = prepareAgentData();
  const airlineData = prepareAirlineData();
  const monthlyData = prepareMonthlyData();

  // Color configurations
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#83a6ed', '#8dd1e1'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatLargeNumber = (number: number) => {
    return new Intl.NumberFormat('ru-RU').format(number);
  };

  const handleExportData = (type: string) => {
    toast({
      title: "Экспорт отчета",
      description: `Ваш ${type} отчет подготовлен к скачиванию.`,
    });
    // In a real app, this would trigger the actual export
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border shadow-sm">
          <CardContent className="py-2 px-3">
            <p className="font-medium">{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={`item-${index}`} style={{ color: entry.color }}>
                {entry.name}: {entry.name.includes("Выручка") 
                  ? formatCurrency(entry.value) 
                  : entry.value}
              </p>
            ))}
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const calculateTotal = serviceMetrics.totalFlights + 
    serviceMetrics.totalTours + 
    serviceMetrics.totalInsurance + 
    serviceMetrics.totalSeats + 
    serviceMetrics.totalBaggage;

  // Show loading state
  if (isLoadingTickets || isLoadingAirlines) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
          <p className="text-muted-foreground">
            Аналитика и статистика по всем продажам
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Select 
              defaultValue={selectedAgentId} 
              onValueChange={setSelectedAgentId}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Выберите оператора" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все операторы</SelectItem>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <CalendarRange className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Выберите период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Последние 7 дней</SelectItem>
                <SelectItem value="month">Последние 30 дней</SelectItem>
                <SelectItem value="quarter">Последние 90 дней</SelectItem>
                <SelectItem value="year">Последние 12 месяцев</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ExportReportDialog agentId={selectedAgentId} timeRange={timeRange} />
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск билетов..."
              className="pl-8 w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       
      </div>
      
      {/* Page Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-primary transition-colors">
          <Link to="/sales-reports" className="block p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">Отчёты о продажах</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Подробная информация о продажах с возможностью фильтрации и экспорта
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">Перейти к отчетам</Button>
            </div>
          </Link>
        </Card>
        
        <Card className="hover:border-primary transition-colors">
          <Link to="/operator-performance" className="block p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">Эффективность операторов</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Статистика и рейтинг эффективности работы операторов
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">Анализ операторов</Button>
            </div>
          </Link>
        </Card>
        
        <Card className="hover:border-primary transition-colors">
          <Link to="/settings" className="block p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">Управление агентами</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Добавление и управление агентами и операторами системы
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">Управление агентами</Button>
            </div>
          </Link>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Обзор продаж
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Briefcase className="h-4 w-4 mr-2" />
            Поставщики
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Users className="h-4 w-4 mr-2" />
            Операторы
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Динамика продаж по месяцам</CardTitle>
              <CardDescription>
                Помесячные данные о количестве и объеме продаж
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${value / 1000}k ₽`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="Выручка" fill="#0088FE" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="count" name="Количество" stroke="#FF8042" strokeWidth={2} dot={{ r: 2 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Распределение продаж по поставщикам</CardTitle>
              <CardDescription>
                Доля каждого поставщика в общей выручке
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topSuppliers}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topSuppliers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-3">Топ поставщиков</h4>
                <div className="space-y-3">
                  {topSuppliers.slice(0, 5).map((supplier, index) => (
                    <div key={supplier.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] + '20', color: COLORS[index % COLORS.length] }}>
                          <span className="text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{supplier.name}</p>
                          <p className="text-xs text-muted-foreground">{supplier.count} продаж</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(supplier.value)}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((supplier.value / totalRevenue) * 100)}% от общей выручки
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Эффективность операторов</CardTitle>
              <CardDescription>
                Сравнение результатов работы операторов по продажам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={agentData}
                    layout="vertical"
                    barCategoryGap={12}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(value) => `${value / 1000}k ₽`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Выручка" fill="#0ea5e9" radius={[0, 4, 4, 0]}>
                      {agentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <Link to="/operator-performance" className="w-full">
                  <Button variant="outline" className="w-full">
                    Перейти к странице эффективности операторов
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
