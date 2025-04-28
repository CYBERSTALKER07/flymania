
import { useState } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { useAirlines } from "@/hooks/use-airlines";
import { format, isWithinInterval, parse } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  FileSpreadsheet,
  Search,
  Calendar,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, Agent } from "@/lib/types";
import { agents } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { exportTicketsToExcel } from "@/lib/excel-export";

export default function SalesReports() {
  const { data: tickets = [], isLoading } = useTickets();
  const { data: airlines = [] } = useAirlines();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const { toast } = useToast();

  // Create a unique list of suppliers from tickets
  const suppliers = Array.from(new Set(tickets.map(ticket => 
    ticket.airline?.name || ticket.supplier || "Unknown"
  ))).sort();

  // Enhance ticket data with additional fields if not present
  const enhancedTickets = tickets.map(ticket => {
    // Calculate base price if not present (60-90% of total price)
    const basePrice = ticket.basePrice || Math.round(ticket.price * (0.6 + Math.random() * 0.3));
    // Calculate fees if not present
    const fees = ticket.fees || (ticket.price - basePrice);
    // Set commission rate if not present (5-15%)
    const commissionRate = ticket.commissionRate || Math.round(5 + Math.random() * 10);
    
    return {
      ...ticket,
      basePrice,
      fees,
      commissionRate,
      serviceType: ticket.serviceType || "flight",
      supplier: ticket.supplier || ticket.airline.name
    };
  });

  // Apply filters
  const filteredTickets = enhancedTickets.filter(ticket => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" ||
      ticket.passengerName.toLowerCase().includes(searchLower) ||
      ticket.origin.city.toLowerCase().includes(searchLower) ||
      ticket.destination.city.toLowerCase().includes(searchLower) ||
      ticket.airline.name.toLowerCase().includes(searchLower);
    
    // Date range filter
    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      isWithinInterval(new Date(ticket.issueDate), {
        start: dateRange.from,
        end: dateRange.to
      });
    
    // Supplier filter
    const matchesSupplier = supplierFilter === "all" || 
      ticket.supplier === supplierFilter ||
      ticket.airline.name === supplierFilter;
    
    // Agent filter
    const matchesAgent = agentFilter === "all" || ticket.agentId === agentFilter;
    
    return matchesSearch && matchesDateRange && matchesSupplier && matchesAgent;
  });

  const handleExportToExcel = () => {
    try {
      exportTicketsToExcel(filteredTickets, 'sales-report');
      
      toast({
        title: "Отчет успешно экспортирован",
        description: "Файл Excel с отчетом о продажах сохранен на ваш компьютер",
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate route description
  const routeDescription = (ticket: Ticket) => {
    return `${ticket.origin.city} (${ticket.origin.iataCode}) → ${ticket.destination.city} (${ticket.destination.iataCode})`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка данных о продажах...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Отчёты о продажах</h1>
          <p className="text-muted-foreground">
            Подробная информация о всех продажах билетов и услуг
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleExportToExcel} 
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Скачать в Excel
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
          <CardDescription>
            Используйте фильтры для поиска нужных транзакций
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Поиск</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск по клиенту, маршруту..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Период</label>
              <DatePickerWithRange 
                date={dateRange}
                setDate={setDateRange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Поставщик</label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Все поставщики" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все поставщики</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Оператор</label>
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Все операторы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все операторы</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Результаты ({filteredTickets.length})</CardTitle>
          <CardDescription>
            Список транзакций, соответствующих заданным фильтрам
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата продажи</TableHead>
                  <TableHead>Дата вылета</TableHead>
                  <TableHead>Ф.И.О клиента</TableHead>
                  <TableHead>Поставщик</TableHead>
                  <TableHead>Маршрут</TableHead>
                  <TableHead>Оператор</TableHead>
                  <TableHead className="text-right">Стоимость тарифа</TableHead>
                  <TableHead className="text-right">Сборы</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead className="text-center">Комиссия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center h-24">
                      Нет данных, соответствующих вашим фильтрам
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{format(new Date(ticket.issueDate), 'dd.MM.yyyy')}</TableCell>
                      <TableCell>{format(new Date(ticket.travelDate), 'dd.MM.yyyy')}</TableCell>
                      <TableCell>{ticket.passengerName}</TableCell>
                      <TableCell>{ticket.supplier}</TableCell>
                      <TableCell>{routeDescription(ticket)}</TableCell>
                      <TableCell>{ticket.agentName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(ticket.basePrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(ticket.fees)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(ticket.price)}</TableCell>
                      <TableCell className="text-center">{ticket.commissionRate}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
