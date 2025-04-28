import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, Plus, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAirlines } from "@/hooks/use-airlines";
import { useAirports } from "@/hooks/use-airports";
import { supabase } from "@/integrations/supabase/client";
import type { Airport, Airline } from "@/lib/types";
import { AirportSearchInput } from "./AirportSearchInput";
import { MultiplePaymentsForm } from "../payments/MultiplePaymentsForm";
import { PaymentData } from "@/hooks/use-ticket-payment";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
interface FlightSegment {
  id: number;
  originAirport: Airport | null;
  destinationAirport: Airport | null;
  airline: Airline | null;
  departureDate: Date;
  pnr: string;
}
const multiCityTicketSchema = z.object({
  passengerName: z.string().min(3, "Passenger name must be at least 3 characters"),
  passengerEmail: z.string().email("Invalid email address"),
  flightSegments: z.array(z.object({
    originAirport: z.string().min(3, "Please select an origin airport"),
    destinationAirport: z.string().min(3, "Please select a destination airport"),
    airline: z.string().min(2, "Please select an airline"),
    departureDate: z.date(),
    pnr: z.string().optional()
  })),
  supplier: z.string().min(2, "Supplier is required"),
  basePrice: z.number().min(0, "Base price must be at least 0"),
  commissionRate: z.number().min(0, "Commission rate must be at least 0"),
  fees: z.number().min(0, "Fees must be at least 0"),
  price: z.number().min(50, "Price must be at least $50"),
  contactInfo: z.string().optional(),
  comments: z.string().optional()
});
type MultiCityTicketFormValues = z.infer<typeof multiCityTicketSchema>;
export function MultiCityTicketForm() {
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
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [segments, setSegments] = useState<FlightSegment[]>([{
    id: 1,
    originAirport: null,
    destinationAirport: null,
    airline: null,
    departureDate: new Date(),
    pnr: ""
  }]);
  const form = useForm<MultiCityTicketFormValues>({
    resolver: zodResolver(multiCityTicketSchema),
    defaultValues: {
      passengerName: "",
      passengerEmail: "",
      flightSegments: [{
        originAirport: "",
        destinationAirport: "",
        airline: "",
        departureDate: new Date(),
        pnr: ""
      }],
      supplier: "",
      basePrice: 0,
      commissionRate: 0,
      fees: 0,
      price: 0,
      contactInfo: "",
      comments: ""
    }
  });
  const addFlightSegment = () => {
    const newSegment = {
      id: segments.length + 1,
      originAirport: null,
      destinationAirport: null,
      airline: null,
      departureDate: new Date(),
      pnr: ""
    };
    setSegments([...segments, newSegment]);
    const currentSegments = form.getValues("flightSegments");
    form.setValue("flightSegments", [...currentSegments, {
      originAirport: "",
      destinationAirport: "",
      airline: "",
      departureDate: new Date(),
      pnr: ""
    }]);
  };
  const validateSegmentData = (data: MultiCityTicketFormValues) => {
    let hasErrors = false;
    for (let index = 0; index < data.flightSegments.length; index++) {
      const segment = data.flightSegments[index];
      const originCode = segment.originAirport.trim().toUpperCase();
      const destinationCode = segment.destinationAirport.trim().toUpperCase();
      const iataRegex = /^[A-Z]{3}$/;
      if (!iataRegex.test(originCode)) {
        toast({
          title: "Invalid Origin Airport",
          description: `The airport code "${originCode}" in segment ${index + 1} must be exactly 3 capital letters.`,
          variant: "destructive"
        });
        hasErrors = true;
      }
      if (!iataRegex.test(destinationCode)) {
        toast({
          title: "Invalid Destination Airport",
          description: `The airport code "${destinationCode}" in segment ${index + 1} must be exactly 3 capital letters.`,
          variant: "destructive"
        });
        hasErrors = true;
      }

      // We'll only log if airport codes are not found, but won't prevent submission
      const originAirport = airports.find(a => a.iataCode === originCode);
      if (!originAirport && iataRegex.test(originCode)) {
        console.log(`Airport code not found in database: ${originCode}`);
      }
      const destinationAirport = airports.find(a => a.iataCode === destinationCode);
      if (!destinationAirport && iataRegex.test(destinationCode)) {
        console.log(`Airport code not found in database: ${destinationCode}`);
      }

      // Still validate airline codes as before
      const airlineData = airlines.find(a => a.iataCode === segment.airline);
      if (!airlineData) {
        toast({
          title: "Invalid Airline",
          description: `The airline code "${segment.airline}" in segment ${index + 1} is not valid.`,
          variant: "destructive"
        });
        hasErrors = true;
      }
    }
    if (hasErrors) {
      console.log("Validation failed with data:", data);
    }
    return !hasErrors;
  };
  const handlePaymentsChange = (paymentData: {
    payments: PaymentData[];
  }) => {
    setPayments(paymentData.payments);
  };
  const onSubmit = async (data: MultiCityTicketFormValues) => {
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
      console.log("Form data:", data);
      console.log("Segments state:", segments);
      const isValid = validateSegmentData(data);
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }
      if (!payments || payments.length === 0) {
        toast({
          title: "Payment Required",
          description: "Please enter at least one payment amount",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      const processedSegments = data.flightSegments.map((segment, index) => {
        const originCode = segment.originAirport.trim().toUpperCase();
        const destinationCode = segment.destinationAirport.trim().toUpperCase();

        // Find the airport or create a placeholder
        const originAirport = airports.find(a => a.iataCode === originCode) || {
          iataCode: originCode,
          city: "Unknown City",
          name: "Unknown Airport",
          country: "Unknown Country"
        };
        const destinationAirport = airports.find(a => a.iataCode === destinationCode) || {
          iataCode: destinationCode,
          city: "Unknown City",
          name: "Unknown Airport",
          country: "Unknown Country"
        };
        const airlineCoded = segment.airline.trim().toUpperCase();
        const selectedAirline = airlines.find(a => a.iataCode === airlineCoded);
        if (!selectedAirline) {
          throw new Error(`Invalid airline code: ${airlineCoded}`);
        }
        const formattedTravelDate = format(segment.departureDate, "yyyy-MM-dd");
        const currentDate = format(new Date(), "yyyy-MM-dd");
        return {
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
          agent_name: user.email || user.id,
          supplier: data.supplier,
          base_price: data.basePrice,
          commission_rate: data.commissionRate,
          fees: data.fees,
          service_type: "flight",
          order_number: segment.pnr || `MCT${Date.now()}-${index + 1}`,
          contact_info: data.contactInfo,
          comments: data.comments
        };
      });
      for (const segment of processedSegments) {
        console.log("Inserting segment:", segment);
        const {
          error
        } = await supabase.from("tickets").insert(segment);
        if (error) {
          console.error("Error inserting ticket:", error);
          throw error;
        }
      }

      // Process the payments
      const ticketId = processedSegments[0].order_number; // Use the first segment's order number for payments
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
          ticket_id: ticketId,
          amount: payment.amount,
          payment_method: paymentMethod,
          payment_date: format(new Date(), "yyyy-MM-dd")
        });
      });
      await Promise.all(paymentPromises);
      toast({
        title: "Multi-City Ticket Created",
        description: `Successfully created ${processedSegments.length} flight segments for ${data.passengerName}`
      });
      navigate("/sold-tickets");
      form.reset();
      setSegments([{
        id: 1,
        originAirport: null,
        destinationAirport: null,
        airline: null,
        departureDate: new Date(),
        pnr: ""
      }]);
      setPayments([]);
    } catch (error) {
      console.error("Error creating multi-city ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create multi-city ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
  return <div className="space-y-6 items-center justify-center flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Билет с несколькими городами</h1>
        <p className="text-muted-foreground">Создайте несколько сегментов полета для одного пассажира</p>
      </div>

      <Card className="max-auto rounded-[50px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full">
        <CardHeader>
          <CardTitle>Информация о билете</CardTitle>
          <CardDescription>Введите данные для билета с несколькими городами</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Информация о пассажире</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="passengerName" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Имя пассажира</FormLabel>
                        <FormControl>
                          <Input id="passengerName" placeholder="Введите имя пассажира" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="passengerEmail" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input id="passengerEmail" type="email" placeholder="Введите email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
              </div>

              {segments.map((segment, index) => <div key={segment.id} className="p-4 border rounded-lg space-y-4">
                  <h3 className="font-medium">Сегмент {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`flightSegments.${index}.originAirport`} render={({
                  field
                }) => <FormItem>
                          <FormLabel>Откуда</FormLabel>
                          <FormControl>
                            <AirportSearchInput id={`segment-${index}-origin`} value={field.value} onChange={airport => {
                      field.onChange(airport.iataCode);
                      const newSegments = [...segments];
                      newSegments[index].originAirport = airport;
                      setSegments(newSegments);
                    }} error={!!form.formState.errors.flightSegments?.[index]?.originAirport} placeholder="Поиск аэропорта отправления" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <FormField control={form.control} name={`flightSegments.${index}.destinationAirport`} render={({
                  field
                }) => <FormItem>
                          <FormLabel>Куда</FormLabel>
                          <FormControl>
                            <AirportSearchInput id={`segment-${index}-destination`} value={field.value} onChange={airport => {
                      field.onChange(airport.iataCode);
                      const newSegments = [...segments];
                      newSegments[index].destinationAirport = airport;
                      setSegments(newSegments);
                    }} error={!!form.formState.errors.flightSegments?.[index]?.destinationAirport} placeholder="Поиск аэропорта прибытия" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name={`flightSegments.${index}.airline`} render={({
                  field
                }) => <FormItem>
                          <FormLabel>Авиакомпания</FormLabel>
                          <FormControl>
                            <Input id={`segment-${index}-airline`} placeholder="Введите код авиакомпании" {...field} onChange={e => {
                      const value = e.target.value.toUpperCase();
                      field.onChange(value);
                      const airline = airlines.find(a => a.iataCode === value);
                      const newSegments = [...segments];
                      newSegments[index].airline = airline || null;
                      setSegments(newSegments);
                    }} className={form.formState.errors.flightSegments?.[index]?.airline ? 'border-red-500' : ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name={`flightSegments.${index}.pnr`} render={({
                  field
                }) => <FormItem>
                          <FormLabel>PNR / Номер заказа</FormLabel>
                          <FormControl>
                            <Input id={`segment-${index}-pnr`} placeholder="Введите номер заказа" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name={`flightSegments.${index}.departureDate`} render={({
                  field
                }) => <FormItem className="flex flex-col">
                          <FormLabel>Дата вылета</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                  {field.value ? format(field.value, "PPP") : <span>Выберите дату</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                </div>)}

              <Button type="button" variant="outline" onClick={addFlightSegment} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Добавить еще один сегмент
              </Button>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Информация о стои��ости</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="supplier" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Поставщик</FormLabel>
                        <FormControl>
                          <Input id="supplier" placeholder="Введите имя поставщика" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="basePrice" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Тариф</FormLabel>
                        <FormControl>
                          <Input id="basePrice" type="number" placeholder="Базовая цена" value={field.value === 0 ? '' : field.value} onChange={e => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      form.setValue("basePrice", value);
                    }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="commissionRate" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Комиссия (%)</FormLabel>
                        <FormControl>
                          <Input id="commissionRate" type="number" placeholder="Процент комиссии" value={field.value === 0 ? '' : field.value} onChange={e => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      form.setValue("commissionRate", value);
                    }} />
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
                    }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
                <FormField control={form.control} name="price" render={({
                field
              }) => <FormItem>
                      <FormLabel> Сумма продажи:(UZS)</FormLabel>
                      <FormControl>
                        <Input id="price" type="number" placeholder="Введите общую стоимость билета" value={field.value === 0 ? '' : field.value} onChange={e => {
                    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    form.setValue("price", value);
                  }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="contactInfo" render={({
                field
              }) => <FormItem>
                      <FormLabel>Контакт</FormLabel>
                      <FormControl>
                        <Input id="contactInfo" placeholder="Введите контактную информацию" {...field} />
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

              <MultiplePaymentsForm totalAmount={form.watch("price") || 0} onChange={handlePaymentsChange} isSubmitting={isSubmitting} />

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