
import { useState } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, Payment } from "@/lib/types";
import { isWithinInterval } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { exportPaymentsToExcel } from "@/lib/excel-export";
import { 
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  BadgeDollarSign,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentsTracker() {
  const { data: tickets = [], isLoading } = useTickets();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Extract all payments from tickets
  const allPayments: (Payment & { ticketId: string })[] = tickets.flatMap(ticket => 
    (ticket.payments || []).map(payment => ({
      ...payment,
      ticketId: ticket.id
    }))
  );
  
  // Apply filters
  const filteredPayments = allPayments.filter(payment => {
    // Search filter - need to find the associated ticket
    const ticket = tickets.find(t => t.id === payment.ticketId);
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = searchQuery === "" || 
      (ticket && (
        ticket.passengerName.toLowerCase().includes(searchLower) ||
        ticket.agentName.toLowerCase().includes(searchLower) ||
        payment.ticketId.toLowerCase().includes(searchLower)
      ));
    
    // Date range filter
    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      (payment.paymentDate && isWithinInterval(new Date(payment.paymentDate), {
        start: dateRange.from,
        end: dateRange.to
      }));
    
    // Payment method filter
    const matchesPaymentMethod = paymentMethodFilter === "all" || 
      payment.paymentMethod === paymentMethodFilter;
    
    // Status filter (using ticket's payment status)
    const matchesStatus = statusFilter === "all" || 
      (ticket && ticket.paymentStatus === statusFilter);
    
    return matchesSearch && matchesDateRange && matchesPaymentMethod && matchesStatus;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const handleExportToExcel = () => {
    try {
      exportPaymentsToExcel(filteredPayments, tickets, 'payment-tracking-report');
      
      toast({
        title: "Отчет успешно экспортирован",
        description: "Файл Excel с отчетом о платежах сохранен на ваш компьютер",
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

  const getPaymentMethodDisplay = (method: string) => {
    switch(method) {
      case 'cash': return 'Наличные';
      case 'bank_transfer': return 'Банковский перевод';
      case 'terminal': return 'Терминал';
      case 'visa': return 'Visa';
      case 'uzcard': return 'UzCard';
      default: return method;
    }
  };

  const getTicketForPayment = (paymentId: string) => {
    return tickets.find(ticket => 
      (ticket.payments || []).some(p => p.id === paymentId)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка платежей...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Трекер платежей</h1>
          <p className="text-muted-foreground">
            Детальная информация о всех платежах по билетам и услугам
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
      
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-1"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Общая сумма платежей</CardTitle>
              <CardDescription>Сумма платежей по выбранным фильтрам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{totalAmount.toLocaleString()} UZS</span>
                <BadgeDollarSign className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Количество платежей: {filteredPayments.length}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Методы оплаты</CardTitle>
              <CardDescription>Распределение платежей по методам оплаты</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['cash', 'bank_transfer', 'terminal', 'visa', 'uzcard'].map((method) => {
                  const methodPayments = filteredPayments.filter(p => p.paymentMethod === method);
                  const methodTotal = methodPayments.reduce((sum, p) => sum + p.amount, 0);
                  const methodCount = methodPayments.length;
                  
                  return (
                    <Card key={method} className="bg-muted/50 border">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center justify-center text-center">
                          <CreditCard className="h-6 w-6 mb-2 text-primary" />
                          <p className="text-sm font-medium">{getPaymentMethodDisplay(method)}</p>
                          <p className="text-lg font-bold mt-1">{methodTotal.toLocaleString()} UZS</p>
                          <p className="text-xs text-muted-foreground mt-1">{methodCount} платеж(ей)</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
            <CardDescription>
              Используйте фильтры для поиска нужных платежей
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
                    placeholder="Поиск по клиенту, ID билета..."
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
                <label className="text-sm font-medium mb-1 block">Метод оплаты</label>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все методы оплаты" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все методы оплаты</SelectItem>
                    <SelectItem value="cash">Наличные</SelectItem>
                    <SelectItem value="bank_transfer">Банковский перевод</SelectItem>
                    <SelectItem value="terminal">Терминал</SelectItem>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="uzcard">UzCard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Статус</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="paid">Полностью оплачено</SelectItem>
                    <SelectItem value="pending">Частично оплачено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Результаты ({filteredPayments.length})</CardTitle>
            <CardDescription>
              Список платежей, соответствующих заданным фильтрам
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата платежа</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Услуга</TableHead>
                    <TableHead>Оператор</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead>Метод оплаты</TableHead>
                    <TableHead>Статус билета</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Нет данных, соответствующих вашим фильтрам
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => {
                      const ticket = tickets.find(t => t.id === payment.ticketId);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {payment.paymentDate 
                              ? format(new Date(payment.paymentDate), 'dd.MM.yyyy')
                              : 'Н/Д'}
                          </TableCell>
                          <TableCell>{ticket?.passengerName || 'Н/Д'}</TableCell>
                          <TableCell>{ticket?.serviceType || 'Авиабилет'}</TableCell>
                          <TableCell>{ticket?.agentName || 'Н/Д'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {payment.amount.toLocaleString()} UZS
                          </TableCell>
                          <TableCell>{getPaymentMethodDisplay(payment.paymentMethod)}</TableCell>
                          <TableCell>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                              ticket?.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {ticket?.paymentStatus === 'paid' 
                                ? 'Оплачено полностью' 
                                : 'Оплачено частично'}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
