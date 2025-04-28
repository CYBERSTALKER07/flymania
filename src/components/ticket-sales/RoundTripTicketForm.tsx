import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { CalendarIcon, Plane, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAirlines } from "@/hooks/use-airlines";
import { useAirportSearch } from "@/hooks/use-airport-search";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
const roundTripTicketSchema = z.object({
  passengerName: z.string().min(3, "Passenger name must be at least 3 characters"),
  originAirport: z.string().min(3, "Please select an origin airport"),
  destinationAirport: z.string().min(3, "Please select a destination airport"),
  airline: z.string().min(2, "Please select an airline"),
  departureDate: z.date(),
  returnDate: z.date(),
  price: z.number().min(50, "Price must be at least $50"),
  serviceType: z.enum(["flight", "tour", "insurance", "seat", "baggage"], {
    required_error: "Select a service type"
  }),
  supplier: z.string().min(2, "Supplier is required"),
  basePrice: z.number().min(0, "Base price must be at least 0"),
  commissionRate: z.number().min(0, "Commission rate must be at least 0"),
  fees: z.number().min(0, "Fees must be at least 0"),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'visa', 'uzcard', 'terminal'], {
    required_error: "Please select a payment method"
  }),
  paymentStatus: z.enum(['pending', 'paid'], {
    required_error: "Please select a payment status"
  }),
  orderNumber: z.string().optional(),
  contactInfo: z.string().optional(),
  comments: z.string().optional()
});
type RoundTripTicketFormValues = z.infer<typeof roundTripTicketSchema>;
const paymentMethodOptions = [{
  label: "Наличные",
  value: "cash"
}, {
  label: "Банковский перевод",
  value: "bank_transfer"
}, {
  label: "VISA",
  value: "visa"
}, {
  label: "UZCARD",
  value: "uzcard"
}, {
  label: "Терминал",
  value: "terminal"
}] as const;
export function RoundTripTicketForm() {
  const {
    data: airlines = [],
    isLoading: isLoadingAirlines
  } = useAirlines();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originSearchQuery, setOriginSearchQuery] = useState("");
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [airlineSearchQuery, setAirlineSearchQuery] = useState("");
  const [selectedOriginAirport, setSelectedOriginAirport] = useState(null);
  const [selectedDestinationAirport, setSelectedDestinationAirport] = useState(null);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const {
    results: originResults,
    isLoading: isLoadingOriginSearch
  } = useAirportSearch({
    query: originSearchQuery
  });
  const {
    results: destinationResults,
    isLoading: isLoadingDestinationSearch
  } = useAirportSearch({
    query: destinationSearchQuery
  });
  const form = useForm<RoundTripTicketFormValues>({
    resolver: zodResolver(roundTripTicketSchema),
    defaultValues: {
      passengerName: "",
      price: 0,
      departureDate: new Date(),
      returnDate: new Date(),
      serviceType: "flight",
      supplier: "",
      basePrice: 0,
      commissionRate: 0,
      fees: 0,
      paymentMethod: "cash",
      paymentStatus: "pending",
      orderNumber: "",
      contactInfo: "",
      comments: ""
    }
  });
  const onSubmit = async (data: RoundTripTicketFormValues) => {
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
      if (!selectedOriginAirport || !selectedDestinationAirport || !selectedAirline) {
        console.error("Missing required selection:", {
          origin: selectedOriginAirport,
          destination: selectedDestinationAirport,
          airline: selectedAirline
        });
        throw new Error("Please select origin airport, destination airport, and airline from the dropdown options.");
      }
      const formattedDepartureDate = format(data.departureDate, "yyyy-MM-dd");
      const formattedReturnDate = format(data.returnDate, "yyyy-MM-dd");
      const currentDate = format(new Date(), "yyyy-MM-dd");
      const agentName = user.email || user.id;
      const {
        error
      } = await supabase.from("tickets").insert({
        passenger_name: data.passengerName,
        origin_code: selectedOriginAirport.iataCode,
        origin_city: selectedOriginAirport.city,
        origin_country: selectedOriginAirport.country,
        origin_name: selectedOriginAirport.name,
        destination_code: selectedDestinationAirport.iataCode,
        destination_city: selectedDestinationAirport.city,
        destination_country: selectedDestinationAirport.country,
        destination_name: selectedDestinationAirport.name,
        airline_code: selectedAirline.iataCode,
        airline_name: selectedAirline.name,
        airline_country: selectedAirline.country,
        travel_date: formattedDepartureDate,
        return_date: formattedReturnDate,
        issue_date: currentDate,
        price: data.price,
        agent_id: user.id,
        agent_name: agentName,
        base_price: data.basePrice,
        commission_rate: data.commissionRate,
        fees: data.fees,
        service_type: data.serviceType,
        supplier: data.supplier,
        payment_method: data.paymentMethod,
        payment_status: data.paymentStatus,
        payment_date: data.paymentStatus === 'paid' ? currentDate : null,
        order_number: data.orderNumber,
        contact_info: data.contactInfo,
        comments: data.comments
      });
      if (error) {
        console.error("Error selling ticket:", error);
        throw error;
      }
      toast({
        title: "Ticket Sold Successfully!",
        description: `Ticket for ${data.passengerName} has been created.`
      });
      navigate("/sold-tickets");
    } catch (error) {
      console.error("Error selling ticket:", error);
      toast({
        title: "Failed to Sell Ticket",
        description: error instanceof Error ? error.message : "An error occurred while processing your request.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const inputRefs = {
    passengerName: React.useRef<HTMLInputElement>(null),
    originAirport: React.useRef<HTMLInputElement>(null),
    destinationAirport: React.useRef<HTMLInputElement>(null),
    airline: React.useRef<HTMLInputElement>(null),
    supplier: React.useRef<HTMLInputElement>(null),
    basePrice: React.useRef<HTMLInputElement>(null),
    commissionRate: React.useRef<HTMLInputElement>(null),
    fees: React.useRef<HTMLInputElement>(null),
    price: React.useRef<HTMLInputElement>(null)
  };
  const handleKeyPress = (currentField: keyof typeof inputRefs) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const fields = Object.keys(inputRefs) as Array<keyof typeof inputRefs>;
      const currentIndex = fields.indexOf(currentField);
      const nextField = fields[currentIndex + 1];
      if (nextField) {
        inputRefs[nextField].current?.focus();
      }
    }
  };
  const handleAirportSearch = (input: string, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOriginSearchQuery(input);
      form.setValue('originAirport', input);
    } else {
      setDestinationSearchQuery(input);
      form.setValue('destinationAirport', input);
    }
  };
  const handleAirlineSearch = (input: string) => {
    setAirlineSearchQuery(input);
    if (!input.trim()) {
      return;
    }
    const filtered = airlines.filter(airline => airline.name.toLowerCase().includes(input.toLowerCase()) || airline.iataCode.toLowerCase().includes(input.toLowerCase())).slice(0, 5);
    return filtered;
  };
  if (isLoadingAirlines) {
    return <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
      </div>;
  }
  return <div className="space-y-6 items-center justify-center flex flex-col">
      <div>
        <h1 className="text-3xl font-bold items-center justify-center tracking-tight">Sell New Ticket</h1>
        <p className="text-muted-foreground">
          Create a new ticket for a customer
        </p>
      </div>
      
      <Card className="max-auto rounded-[50px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full">
        <CardHeader>
          <CardTitle>Ticket Information</CardTitle>
          <CardDescription>
            Enter the details for the new ticket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="passengerName" render={({
              field
            }) => <FormItem>
                    <FormLabel>Имя пассажира</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите полное имя пассажира" {...field} ref={inputRefs.passengerName} onKeyPress={handleKeyPress('passengerName')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="originAirport" render={({
                field
              }) => <FormItem>
                      <FormLabel>Аэропорт отправления</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input placeholder="Поиск аэропорта (например, JFK, Нью-Йорк)" {...field} ref={inputRefs.originAirport} onKeyPress={handleKeyPress('originAirport')} onChange={e => handleAirportSearch(e.target.value, 'origin')} />
                        </FormControl>
                        {isLoadingOriginSearch && <div className="absolute right-3 top-3">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          </div>}
                        {originResults.length > 0 && <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
                            {originResults.map(airport => <div key={airport.iataCode} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                      form.setValue('originAirport', airport.iataCode);
                      setSelectedOriginAirport(airport);
                      setOriginSearchQuery("");
                    }}>
                                <div className="flex justify-between">
                                  <span className="font-medium">{airport.city} ({airport.iataCode})</span>
                                  <span className="text-xs text-gray-500">{airport.country}</span>
                                </div>
                                <div className="text-xs text-gray-500 truncate">{airport.name}</div>
                              </div>)}
                          </div>}
                      </div>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="destinationAirport" render={({
                field
              }) => <FormItem>
                      <FormLabel>Аэропорт назначения</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input placeholder="Поиск аэропорта (например, LAX, Лос-Анджелес)" {...field} ref={inputRefs.destinationAirport} onKeyPress={handleKeyPress('destinationAirport')} onChange={e => handleAirportSearch(e.target.value, 'destination')} />
                        </FormControl>
                        {isLoadingDestinationSearch && <div className="absolute right-3 top-3">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          </div>}
                        {destinationResults.length > 0 && <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
                            {destinationResults.map(airport => <div key={airport.iataCode} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                      form.setValue('destinationAirport', airport.iataCode);
                      setSelectedDestinationAirport(airport);
                      setDestinationSearchQuery("");
                    }}>
                                <div className="flex justify-between">
                                  <span className="font-medium">{airport.city} ({airport.iataCode})</span>
                                  <span className="text-xs text-gray-500">{airport.country}</span>
                                </div>
                                <div className="text-xs text-gray-500 truncate">{airport.name}</div>
                              </div>)}
                          </div>}
                      </div>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <FormField control={form.control} name="airline" render={({
              field
            }) => <FormItem>
                    <FormLabel>Авиакомпания</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="Поиск авиакомпании (например, AA, American Airlines)" {...field} ref={inputRefs.airline} onKeyPress={handleKeyPress('airline')} onChange={e => {
                    setAirlineSearchQuery(e.target.value);
                    field.onChange(e);
                  }} />
                      </FormControl>
                      {airlineSearchQuery && <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
                          {airlines.filter(airline => airline.name.toLowerCase().includes(airlineSearchQuery.toLowerCase()) || airline.iataCode.toLowerCase().includes(airlineSearchQuery.toLowerCase())).slice(0, 5).map(airline => <div key={airline.iataCode} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                    form.setValue('airline', airline.iataCode);
                    setSelectedAirline(airline);
                    setAirlineSearchQuery("");
                  }}>
                                <div className="flex justify-between">
                                  <span className="font-medium">{airline.name}</span>
                                  <span className="text-xs font-semibold">{airline.iataCode}</span>
                                </div>
                                <div className="text-xs text-gray-500">{airline.country}</div>
                              </div>)}
                        </div>}
                    </div>
                    <FormMessage />
                  </FormItem>} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="departureDate" render={({
                field
              }) => <FormItem className="flex flex-col">
                      <FormLabel>Дата отправления</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
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

                <FormField control={form.control} name="returnDate" render={({
                field
              }) => <FormItem className="flex flex-col">
                      <FormLabel>Дата возвращения</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
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
                      <select className="w-full px-3 py-2 border rounded-md bg-background" {...field}>
                        <option value="flight">Рейс</option>
                        <option value="tour">Тур</option>
                        <option value="insurance">Страхование</option>
                        <option value="seat">Место</option>
                        <option value="baggage">Багаж</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="supplier" render={({
              field
            }) => <FormItem>
                    <FormLabel>Поставщик</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите имя поставщика" {...field} ref={inputRefs.supplier} onKeyPress={handleKeyPress('supplier')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="basePrice" render={({
                field
              }) => <FormItem>
                      <FormLabel>Тариф</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Базовая цена" {...field} ref={inputRefs.basePrice} onKeyPress={handleKeyPress('basePrice')} onChange={e => {
                    const value = e.target.value ? parseFloat(e.target.value) : 0;
                    form.setValue("basePrice", value);
                  }} value={field.value === 0 ? '' : field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="commissionRate" render={({
                field
              }) => <FormItem>
                      <FormLabel>Комиссионныe  (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Процент комиссии %" {...field} ref={inputRefs.commissionRate} onKeyPress={handleKeyPress('commissionRate')} onChange={e => {
                    const value = e.target.value ? parseFloat(e.target.value) : 0;
                    form.setValue("commissionRate", value);
                  }} value={field.value === 0 ? '' : field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="fees" render={({
                field
              }) => <FormItem>
                      <FormLabel>Стоимость</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Введите сборы" {...field} ref={inputRefs.fees} onKeyPress={handleKeyPress('fees')} onChange={e => {
                    const value = e.target.value ? parseFloat(e.target.value) : 0;
                    form.setValue("fees", value);
                  }} value={field.value === 0 ? '' : field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <FormField control={form.control} name="price" render={({
              field
            }) => <FormItem>
                    <FormLabel> Сумма продажи:(UZS)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Введите цену билета" {...field} ref={inputRefs.price} onKeyPress={handleKeyPress('price')} onChange={e => {
                  const value = e.target.value ? parseFloat(e.target.value) : 0;
                  form.setValue("price", value);
                }} value={field.value === 0 ? '' : field.value} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="paymentMethod" render={({
                field
              }) => <FormItem>
                      <FormLabel>Метод оплаты</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите метод оплаты" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethodOptions.map(option => <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="paymentStatus" render={({
                field
              }) => <FormItem>
                      <FormLabel>Статус оплаты</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус оплаты" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">В ожидании</SelectItem>
                          <SelectItem value="paid">Оплачен</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <FormField control={form.control} name="orderNumber" render={({
              field
            }) => <FormItem>
                    <FormLabel>PNR / Номер заказа</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите номер заказа" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="contactInfo" render={({
              field
            }) => <FormItem>
                    <FormLabel>Контакт</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите контактную информацию" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="comments" render={({
              field
            }) => <FormItem>
                    <FormLabel>Комментарии</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Введите комментарии" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Selling Ticket...
                    </> : <>
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      Sell Ticket
                    </>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>;
}