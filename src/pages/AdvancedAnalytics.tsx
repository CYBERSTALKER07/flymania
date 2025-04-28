
import { useState, useEffect } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, subMonths, parseISO, isAfter } from "date-fns";
import { SupplierRevenue, MonthlyData, Ticket } from "@/lib/types";
import { formatCurrency, getRandomColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { exportDashboardToExcel } from "@/lib/excel-export";
import { Button } from "@/components/ui/button";
import { FileDown, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { MetricCard } from "@/components/ui/metric-card";

// Type for the filtered data
type FilteredData = {
  tickets: Ticket[];
  startDate: Date;
  endDate: Date;
};

// Function to get filtered data based on the time period
const getFilteredData = (tickets: Ticket[], period: string): FilteredData => {
  const today = new Date();
  let startDate: Date;

  if (period === "7d") {
    startDate = subDays(today, 7);
  } else if (period === "30d") {
    startDate = subDays(today, 30);
  } else if (period === "90d") {
    startDate = subDays(today, 90);
  } else {
    // Default to 12 months
    startDate = subMonths(today, 12);
  }

  return {
    tickets: tickets.filter((ticket) => isAfter(parseISO(ticket.issueDate), startDate)),
    startDate,
    endDate: today,
  };
};

// Function to get monthly data
const getMonthlyData = (tickets: Ticket[]): MonthlyData[] => {
  const monthsData = new Map<string, { revenue: number; count: number }>();

  tickets.forEach((ticket) => {
    const monthYear = format(parseISO(ticket.issueDate), "MMM yyyy");
    
    if (!monthsData.has(monthYear)) {
      monthsData.set(monthYear, { revenue: 0, count: 0 });
    }
    
    const data = monthsData.get(monthYear)!;
    data.revenue += ticket.price;
    data.count += 1;
  });

  // Convert map to array and sort by date
  return Array.from(monthsData.entries())
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      count: data.count,
    }))
    .sort((a, b) => {
      // Parse month strings like "Jan 2023" back to dates for proper sorting
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
};

// Function to get supplier data
const getSupplierData = (tickets: Ticket[]): SupplierRevenue[] => {
  const suppliersData = new Map<string, { name: string; revenue: number; count: number }>();

  tickets.forEach((ticket) => {
    const supplier = ticket.supplier || ticket.airline.name;
    const supplierKey = supplier.toLowerCase().replace(/\s+/g, "_");
    
    if (!suppliersData.has(supplierKey)) {
      suppliersData.set(supplierKey, { name: supplier, revenue: 0, count: 0 });
    }
    
    const data = suppliersData.get(supplierKey)!;
    data.revenue += ticket.price;
    data.count += 1;
  });

  // Convert map to array and sort by revenue
  return Array.from(suppliersData.entries())
    .map(([supplier, data]) => ({
      supplier,
      name: data.name,
      revenue: data.revenue,
      count: data.count,
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

// Function to get service type metrics
const getServiceMetrics = (tickets: Ticket[]) => {
  return tickets.reduce(
    (metrics, ticket) => {
      const serviceType = ticket.serviceType || "flight";
      
      if (serviceType === "flight") metrics.totalFlights++;
      else if (serviceType === "tour") metrics.totalTours++;
      else if (serviceType === "insurance") metrics.totalInsurance++;
      else if (serviceType === "seat") metrics.totalSeats++;
      else if (serviceType === "baggage") metrics.totalBaggage++;
      
      metrics.totalRevenue += ticket.price;
      
      return metrics;
    },
    {
      totalFlights: 0,
      totalTours: 0,
      totalInsurance: 0,
      totalSeats: 0,
      totalBaggage: 0,
      totalRevenue: 0,
    }
  );
};

// Function to get payment methods data
const getPaymentMethodsData = (tickets: Ticket[]) => {
  const paymentMethods = new Map<string, { count: number; revenue: number }>();
  
  tickets.forEach((ticket) => {
    const method = ticket.paymentMethod || "unknown";
    
    if (!paymentMethods.has(method)) {
      paymentMethods.set(method, { count: 0, revenue: 0 });
    }
    
    const data = paymentMethods.get(method)!;
    data.count += 1;
    data.revenue += ticket.price;
  });
  
  return Array.from(paymentMethods.entries())
    .map(([method, data]) => ({
      name: method === "cash" ? "Наличные" :
            method === "bank_transfer" ? "Банковский перевод" :
            method === "visa" ? "Visa" :
            method === "uzcard" ? "UzCard" :
            method === "terminal" ? "Терминал" : "Неизвестно",
      value: data.count,
      revenue: data.revenue,
    }));
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function AdvancedAnalytics() {
  const { data: ticketsData } = useTickets();
  const tickets = ticketsData || []; // Access the data directly without .tickets
  const [timePeriod, setTimePeriod] = useState("30d");
  const [filteredData, setFilteredData] = useState<FilteredData>({
    tickets: [],
    startDate: new Date(),
    endDate: new Date(),
  });
  const { toast } = useToast();

  // Update filtered data when tickets or time period changes
  useEffect(() => {
    if (tickets.length > 0) {
      setFilteredData(getFilteredData(tickets, timePeriod));
    }
  }, [tickets, timePeriod]);

  // Calculate metrics from filtered data
  const monthlyData = getMonthlyData(filteredData.tickets);
  const supplierData = getSupplierData(filteredData.tickets);
  const serviceMetrics = getServiceMetrics(filteredData.tickets);
  const paymentMethodsData = getPaymentMethodsData(filteredData.tickets);

  // COLORS
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Handle export
  const handleExport = () => {
    try {
      exportDashboardToExcel(
        serviceMetrics,
        supplierData,
        monthlyData,
        "advanced-analytics"
      );
      toast({
        title: "Экспорт выполнен",
        description: "Аналитические данные успешно экспортированы в Excel",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
      });
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Расширенная аналитика</h1>
          <p className="text-muted-foreground">
            Подробный анализ данных о продажах и трендах
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={timePeriod}
            onValueChange={setTimePeriod}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Последние 7 дней</SelectItem>
              <SelectItem value="30d">Последние 30 дней</SelectItem>
              <SelectItem value="90d">Последние 90 дней</SelectItem>
              <SelectItem value="12m">Последние 12 месяцев</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport}>
            <FileDown className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <motion.div variants={itemVariants} className="col-span-1">
          <MetricCard
            title="Билеты"
            value={serviceMetrics.totalFlights}
            description="Проданные авиабилеты"
            trend={serviceMetrics.totalFlights > 0 ? 5 : 0}
            iconColor="#0E76FD"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="col-span-1">
          <MetricCard
            title="Туры"
            value={serviceMetrics.totalTours}
            description="Забронированные туры"
            trend={serviceMetrics.totalTours > 0 ? 12 : 0}
            iconColor="#FFB100"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="col-span-1">
          <MetricCard
            title="Страховки"
            value={serviceMetrics.totalInsurance}
            description="Проданные страховки"
            trend={serviceMetrics.totalInsurance > 0 ? 3 : 0}
            iconColor="#10B981"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="col-span-1">
          <MetricCard
            title="Доп. услуги"
            value={serviceMetrics.totalSeats + serviceMetrics.totalBaggage}
            description="Места и багаж"
            trend={serviceMetrics.totalSeats + serviceMetrics.totalBaggage > 0 ? -2 : 0}
            iconColor="#8B5CF6"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="col-span-1">
          <MetricCard
            title="Общая выручка"
            value={formatCurrency(serviceMetrics.totalRevenue)}
            description="За выбранный период"
            trend={serviceMetrics.totalRevenue > 0 ? 8 : 0}
            iconColor="#F87171"
            isValueString
          />
        </motion.div>
      </motion.div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Выручка</TabsTrigger>
          <TabsTrigger value="suppliers">Поставщики</TabsTrigger>
          <TabsTrigger value="payment-methods">Способы оплаты</TabsTrigger>
          <TabsTrigger value="trends">Тренды</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="revenue" className="space-y-4">
            <motion.div
              key="revenue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Динамика выручки по месяцам</CardTitle>
                  <CardDescription>
                    Тренд выручки за выбранный период времени
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                      data={monthlyData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), "Выручка"]} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Выручка"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <motion.div
              key="suppliers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Выручка по поставщикам</CardTitle>
                  <CardDescription>
                    Распределение выручки по поставщикам услуг
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={supplierData.slice(0, 5)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                          nameKey="name"
                          label={(entry) => entry.name}
                        >
                          {supplierData.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={supplierData.slice(0, 5)}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                        <Legend />
                        <Bar dataKey="revenue" name="Выручка" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="payment-methods" className="space-y-4">
            <motion.div
              key="payment-methods"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Способы оплаты</CardTitle>
                  <CardDescription>
                    Распределение платежей по способам оплаты
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={paymentMethodsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={(entry) => entry.name}
                        >
                          {paymentMethodsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={paymentMethodsData}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip formatter={(value, name) => [
                          name === "revenue" ? formatCurrency(value as number) : value,
                          name === "revenue" ? "Выручка" : "Количество"
                        ]} />
                        <Legend />
                        <Bar dataKey="revenue" name="Выручка" fill="#0EA5E9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Количество продаж по месяцам</CardTitle>
                  <CardDescription>
                    Динамика количества продаж за выбранный период
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={monthlyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
                      <Legend />
                      <Bar
                        dataKey="revenue" 
                        name="Выручка" 
                        fill="#0EA5E9" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
