import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Plane, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAirlines } from "@/hooks/use-airlines";
import { useAirports } from "@/hooks/use-airports";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MultiplePaymentsForm } from "@/components/payments/MultiplePaymentsForm";
const oneWayTicketSchema = z.object({
  passengerName: z.string().min(3, "Passenger name must be at least 3 characters"),
  originAirport: z.string().min(3, "Please select an origin airport"),
  destinationAirport: z.string().min(3, "Please select a destination airport"),
  airline: z.string().min(2, "Please select an airline"),
  travelDate: z.date(),
  price: z.number().min(50, "Price must be at least $50"),
  serviceType: z.enum(["flight"], {
    required_error: "Service type is required"
  }),
  supplier: z.string().min(2, "Supplier is required"),
  basePrice: z.number().min(0, "Base price must be at least 0"),
  commissionRate: z.number().min(0, "Commission rate must be at least 0"),
  fees: z.number().min(0, "Fees must be at least 0"),
  paymentStatus: z.enum(['pending', 'paid'], {
    required_error: "Please select a payment status"
  }),
  orderNumber: z.string().optional(),
  contactInfo: z.string().optional(),
  comments: z.string().optional()
});
type TicketFormValues = z.infer<typeof oneWayTicketSchema>;
export function OneWayTicketForm() {
  const {
    data: airlines = [],
    isLoading: isLoadingAirlines
  } = useAirlines();
  const {
    data: airports = [],
    isLoading: isLoadingAirports
  } = useAirports();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payments, setPayments] = useState<Array<{
    amount: number;
    paymentMethod: string;
  }>>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [suggestions, setSuggestions] = useState<{
    originAirport: {
      id: string;
      value: string;
      label: string;
    }[];
    destinationAirport: {
      id: string;
      value: string;
      label: string;
    }[];
    airline: {
      id: string;
      value: string;
      label: string;
    }[];
  }>({
    originAirport: [],
    destinationAirport: [],
    airline: []
  });
  console.log("Available airlines:", airlines?.length || 0);
  console.log("Available airports:", airports?.length || 0);
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(oneWayTicketSchema),
    defaultValues: {
      passengerName: "",
      originAirport: "",
      destinationAirport: "",
      airline: "",
      price: 0,
      travelDate: new Date(),
      serviceType: "flight",
      supplier: "",
      basePrice: 0,
      commissionRate: 0,
      fees: 0,
      paymentStatus: "pending",
      orderNumber: "",
      contactInfo: "",
      comments: ""
    }
  });
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string, nextFieldId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fieldName === 'originAirport' || fieldName === 'destinationAirport') {
        const value = (e.target as HTMLInputElement).value.toUpperCase();
        const match = airports.find(airport => airport.iataCode.toLowerCase().includes(value.toLowerCase()) || airport.city.toLowerCase().includes(value.toLowerCase()));
        if (match) {
          form.setValue(fieldName as any, match.iataCode);
          const nextField = document.getElementById(nextFieldId);
          if (nextField) {
            nextField.focus();
          }
        }
      } else if (fieldName === 'airline') {
        const value = (e.target as HTMLInputElement).value.toUpperCase();
        const match = airlines.find(airline => airline.iataCode.toLowerCase().includes(value.toLowerCase()) || airline.name.toLowerCase().includes(value.toLowerCase()));
        if (match) {
          form.setValue('airline', match.iataCode);
          const nextField = document.getElementById(nextFieldId);
          if (nextField) {
            nextField.focus();
          }
        }
      } else {
        const nextField = document.getElementById(nextFieldId);
        if (nextField) {
          nextField.focus();
        }
      }
    }
  };
  const handlePaymentSubmit = (paymentData: {
    payments: Array<{
      amount: number;
      paymentMethod: string;
    }>;
  }) => {
    setPayments(paymentData.payments);
    const totalPaidAmount = paymentData.payments.reduce((sum, payment) => sum + payment.amount, 0);
    setTotalPaid(totalPaidAmount);
    const currentPrice = form.getValues('price');
    if (totalPaidAmount === 0) {
      form.setValue('paymentStatus', 'pending');
    } else if (totalPaidAmount < currentPrice) {
      form.setValue('paymentStatus', 'pending');
    } else {
      form.setValue('paymentStatus', 'paid');
    }
  };
  const handlePaymentChange = (paymentData: {
    payments: Array<{
      amount: number;
      paymentMethod: string;
    }>;
  }) => {
    setPayments(paymentData.payments);
    const totalPaidAmount = paymentData.payments.reduce((sum, payment) => sum + payment.amount, 0);
    setTotalPaid(totalPaidAmount);
    const currentPrice = form.getValues('price');
    if (totalPaidAmount === 0) {
      form.setValue('paymentStatus', 'pending');
    } else if (totalPaidAmount < currentPrice) {
      form.setValue('paymentStatus', 'pending');
    } else {
      form.setValue('paymentStatus', 'paid');
    }
  };
  const onSubmit = async (data: TicketFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to sell tickets.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const originAirport = airports.find(a => a.iataCode.toLowerCase() === data.originAirport.toLowerCase());
      const destinationAirport = airports.find(a => a.iataCode.toLowerCase() === data.destinationAirport.toLowerCase());
      const selectedAirline = airlines.find(a => a.iataCode.toLowerCase() === data.airline.toLowerCase());
      console.log("Searching for airport:", data.originAirport);
      console.log("Found origin airport:", originAirport);
      console.log("Searching for destination:", data.destinationAirport);
      console.log("Found destination airport:", destinationAirport);
      console.log("Searching for airline:", data.airline);
      console.log("Found airline:", selectedAirline);
      if (!originAirport) {
        throw new Error(`Origin airport "${data.originAirport}" not found. Please select a valid airport code.`);
      }
      if (!destinationAirport) {
        throw new Error(`Destination airport "${data.destinationAirport}" not found. Please select a valid airport code.`);
      }
      if (!selectedAirline) {
        throw new Error(`Airline "${data.airline}" not found. Please select a valid airline code.`);
      }
      const formattedTravelDate = format(data.travelDate, "yyyy-MM-dd");
      const currentDate = format(new Date(), "yyyy-MM-dd");
      const agentName = user.email || user.id;
      const {
        data: ticketData,
        error: ticketError
      } = await supabase.from("tickets").insert({
        passenger_name: data.passengerName,
        origin_code: originAirport.iataCode,
        origin_city: originAirport.city,
        origin_country: originAirport.country,
        origin_name: originAirport.name,
        destination_code: destinationAirport.iataCode,
        destination_city: destinationAirport.city,
        destination_country: destinationAirport.country,
        destination_name: destinationAirport.name,
        airline_code: selectedAirline.iataCode,
        airline_name: selectedAirline.name,
        airline_country: selectedAirline.country,
        travel_date: formattedTravelDate,
        issue_date: currentDate,
        price: data.price,
        agent_id: user.id,
        agent_name: agentName,
        supplier: data.supplier,
        base_price: data.basePrice,
        commission_rate: data.commissionRate,
        fees: data.fees,
        service_type: data.serviceType,
        payment_status: data.paymentStatus,
        payment_date: data.paymentStatus === 'paid' ? currentDate : null,
        order_number: data.orderNumber,
        contact_info: data.contactInfo,
        comments: data.comments
      }).select().single();
      if (ticketError) {
        console.error("Error selling ticket:", ticketError);
        throw ticketError;
      }
      if (payments.length > 0) {
        const paymentPromises = payments.map(payment => {
          let paymentMethod: "cash" | "bank_transfer" | "visa" | "uzcard" | "terminal";
          switch (payment.paymentMethod) {
            case "cash":
              paymentMethod = "cash";
              break;
            case "bank_transfer":
              paymentMethod = "bank_transfer";
              break;
            case "terminal":
              paymentMethod = "terminal";
              break;
            case "visa":
              paymentMethod = "visa";
              break;
            default:
              paymentMethod = "cash";
          }
          return supabase.from("ticket_payments").insert({
            ticket_id: ticketData.id,
            amount: payment.amount,
            payment_method: paymentMethod,
            payment_date: currentDate
          });
        });
        const paymentResults = await Promise.all(paymentPromises);
        const paymentErrors = paymentResults.filter(result => result.error);
        if (paymentErrors.length > 0) {
          console.error("Error adding payments:", paymentErrors);
        }
      }
      toast({
        title: "Ticket Sold Successfully!",
        description: `Ticket for ${data.passengerName} has been created.`
      });
      navigate("/sold-tickets");
    } catch (error: any) {
      console.error("Error selling ticket:", error);
      toast({
        title: "Failed to Sell Ticket",
        description: error.message || "An error occurred while processing your request.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInputChange = (fieldName: string, value: string) => {
    const upperValue = value.toUpperCase();
    if (fieldName === 'originAirport' || fieldName === 'destinationAirport') {
      if (upperValue.length > 0) {
        const filteredAirports = airports.filter(airport => airport.iataCode.toLowerCase().includes(upperValue.toLowerCase()) || airport.city.toLowerCase().includes(upperValue.toLowerCase()) || airport.name.toLowerCase().includes(upperValue.toLowerCase())).slice(0, 5).map(airport => ({
          id: airport.iataCode,
          value: airport.iataCode,
          label: `${airport.iataCode} - ${airport.city} (${airport.name})`
        }));
        if (fieldName === 'originAirport') {
          setSuggestions(prev => ({
            ...prev,
            originAirport: filteredAirports
          }));
        } else {
          setSuggestions(prev => ({
            ...prev,
            destinationAirport: filteredAirports
          }));
        }
      }
    } else if (fieldName === 'airline') {
      if (upperValue.length > 0) {
        const filteredAirlines = airlines.filter(airline => airline.iataCode.toLowerCase().includes(upperValue.toLowerCase()) || airline.name.toLowerCase().includes(upperValue.toLowerCase())).slice(0, 5).map(airline => ({
          id: airline.iataCode,
          value: airline.iataCode,
          label: `${airline.iataCode} - ${airline.name}`
        }));
        setSuggestions(prev => ({
          ...prev,
          airline: filteredAirlines
        }));
      }
    }
  };
  if (isLoadingAirlines || isLoadingAirports) {
    return <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
      </div>;
  }
  if (airports.length === 0 || airlines.length === 0) {
    return <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md p-6 bg-background border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Система не готова</h2>
          <p className="mb-4">
            {airports.length === 0 && "Не удалось загрузить список аэропортов. "}
            {airlines.length === 0 && "Не удалось загрузить список авиакомпаний."}
          </p>
          <p>Пожалуйста, попробуйте позже или обратитесь к администратору.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            На главную
          </Button>
        </div>
      </div>;
  }
  const currentPrice = form.watch('price');
  return <div className="space-y-6 items-center justify-center flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Билет в одну сторону</h1>
        <p className="text-muted-foreground">Создайте билет на рейс в одну сторону</p>
      </div>
      
      <Card className="max-auto rounded-[50px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full">
        <CardHeader>
          <CardTitle>Информация о билете</CardTitle>
          <p className="text-sm text-muted-foreground">
            Введите данные для нового билета
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="passengerName" render={({
              field
            }) => <FormItem>
                    <FormLabel>Имя пассажира</FormLabel>
                    <FormControl>
                      <Input id="passengerName" placeholder="Введите полное имя пассажира" {...field} onKeyDown={e => handleKeyDown(e, 'passengerName', 'originAirport')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="originAirport" render={({
                field
              }) => <FormItem>
                      <FormLabel>Аэропорт отправления</FormLabel>
                      <FormControl>
                        <Input id="originAirport" placeholder="Введите и нажмите Enter для поиска" {...field} value={field.value} onChange={e => {
                    field.onChange(e.target.value.toUpperCase());
                    handleInputChange('originAirport', e.target.value);
                  }} onKeyDown={e => handleKeyDown(e, 'originAirport', 'destinationAirport')} className="uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="destinationAirport" render={({
                field
              }) => <FormItem>
                      <FormLabel>Аэропорт назначения</FormLabel>
                      <FormControl>
                        <Input id="destinationAirport" placeholder="Введите и нажмите Enter для поиска" {...field} value={field.value} onChange={e => {
                    field.onChange(e.target.value.toUpperCase());
                    handleInputChange('destinationAirport', e.target.value);
                  }} onKeyDown={e => handleKeyDown(e, 'destinationAirport', 'airline')} className="uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
              
              <FormField control={form.control} name="airline" render={({
              field
            }) => <FormItem>
                    <FormLabel>Авиакомпания</FormLabel>
                    <FormControl>
                      <Input id="airline" placeholder="Введите и нажмите Enter для поиска" {...field} value={field.value} onChange={e => {
                  field.onChange(e.target.value.toUpperCase());
                  handleInputChange('airline', e.target.value);
                }} onKeyDown={e => handleKeyDown(e, 'airline', 'travelDate')} className="uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="travelDate" render={({
                field
              }) => <FormItem className="flex flex-col">
                      <FormLabel>Дата поездки</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button id="travelDate" variant="outline" className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Выберите дату</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>} />
              </div>
              
              <FormField control={form.control} name="serviceType" render={({
              field
            }) => <FormItem>
                    <FormLabel>Тип услуги</FormLabel>
                    <FormControl>
                      <select className="w-full px-3 py-2 border rounded-md bg-background" {...field} id="serviceType" onKeyDown={e => handleKeyDown(e, 'serviceType', 'supplier')}>
                        <option value="flight">Рейс</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="supplier" render={({
              field
            }) => <FormItem>
                    <FormLabel>Поставщик</FormLabel>
                    <FormControl>
                      <Input id="supplier" placeholder="Введите имя поставщика" {...field} onKeyDown={e => handleKeyDown(e, 'supplier', 'basePrice')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="basePrice" render={({
                field
              }) => <FormItem>
                      <FormLabel>          Тариф</FormLabel>
                      <FormControl>
                        <Input id="basePrice" type="number" placeholder="Базовая цена" value={field.value === 0 ? '' : field.value} onChange={e => {
                    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    form.setValue("basePrice", value);
                  }} onKeyDown={e => handleKeyDown(e, 'basePrice', 'commissionRate')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                <FormField control={form.control} name="commissionRate" render={({
                field
              }) => <FormItem>
                      <FormLabel className="bg-zinc-50">Комиссионное (%)</FormLabel>
                      <FormControl>
                        <Input id="commissionRate" type="number" placeholder="Комиссионный сбор %" value={field.value === 0 ? '' : field.value} onChange={e => {
                    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    form.setValue("commissionRate", value);
                  }} onKeyDown={e => handleKeyDown(e, 'commissionRate', 'fees')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                <FormField control={form.control} name="fees" render={({
                field
              }) => <FormItem>
                      <FormLabel>Стоимость</FormLabel>
                      <FormControl>
                        <Input id="fees" type="number" placeholder="Введите сборы" value={field.value === 0 ? '' : field.value} onChange={e => {
                    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    form.setValue("fees", value);
                  }} onKeyDown={e => handleKeyDown(e, 'fees', 'price')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
              
              <FormField control={form.control} name="price" render={({
              field
            }) => <FormItem>
                    <FormLabel>Сумма продажи (UZS)</FormLabel>
                    <FormControl>
                      <Input id="price" type="number" placeholder="Введите цену билета" value={field.value === 0 ? '' : field.value} onChange={e => {
                  const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                  form.setValue("price", value);
                }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <div className="border p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Методы оплаты</h3>
                <MultiplePaymentsForm totalAmount={currentPrice || 0} onSubmit={handlePaymentSubmit} isSubmitting={isSubmitting} onChange={handlePaymentChange} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="orderNumber" render={({
                field
              }) => <FormItem>
                      <FormLabel>PNR / Номер заказа</FormLabel>
                      <FormControl>
                        <Input id="orderNumber" placeholder="Введите номер заказа" {...field} onKeyDown={e => handleKeyDown(e, 'orderNumber', 'contactInfo')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="contactInfo" render={({
                field
              }) => <FormItem>
                      <FormLabel>Контакт</FormLabel>
                      <FormControl>
                        <Input id="contactInfo" placeholder="Введите контактную информацию" {...field} onKeyDown={e => handleKeyDown(e, 'contactInfo', 'comments')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <FormField control={form.control} name="comments" render={({
              field
            }) => <FormItem>
                    <FormLabel>Комментарии</FormLabel>
                    <FormControl>
                      <Textarea id="comments" placeholder="Введите комментарии к заказу" {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Продажа билета...
                    </> : <>
                      <Plane className="mr-2 h-4 w-4" />
                      Продать билет
                    </>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>;
}