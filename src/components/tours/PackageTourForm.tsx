
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiplePaymentsForm } from "@/components/payments/MultiplePaymentsForm";
import { useTicketPayment, PaymentData } from "@/hooks/use-ticket-payment";
import { useState } from "react";

const formSchema = z.object({
  supplier: z.string().min(1, "Поставщик обязателен"),
  orderNumber: z.string().min(1, "Номер заказа обязателен"),
  netPrice: z.string().min(1, "Стоимость нетто обязательна"),
  grossPrice: z.string().min(1, "Стоимость брутто обязательна"),
});

export function PackageTourForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  
  const { 
    isSubmitting, 
    handlePaymentsChange, 
    handlePaymentSubmit 
  } = useTicketPayment({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Турпакет успешно оформлен",
      });
      navigate('/');
    }
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: "",
      orderNumber: "",
      netPrice: "",
      grossPrice: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Необходимо авторизоваться",
      });
      return;
    }

    try {
      const { data, error } = await supabase.from('tickets').insert({
        agent_id: user.id,
        agent_name: user.email?.split('@')[0] || "Unknown",
        supplier: values.supplier,
        order_number: values.orderNumber,
        service_type: 'package_tour',
        base_price: Number(values.netPrice),
        price: Number(values.grossPrice),
        issue_date: new Date().toISOString(),
        travel_date: new Date().toISOString(),
        passenger_name: "Tour Package",
        origin_city: "N/A",
        origin_code: "N/A",
        origin_country: "N/A",
        origin_name: "N/A",
        destination_city: "N/A",
        destination_code: "N/A",
        destination_country: "N/A",
        destination_name: "N/A",
        airline_code: "N/A",
        airline_name: "N/A",
        airline_country: "N/A",
        payment_status: 'pending'
      }).select();

      if (error) throw error;

      if (data && data[0]) {
        setTicketId(data[0].id);
      }
    } catch (error: any) {
      console.error("Error submitting package tour:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Произошла ошибка при оформлении турпакета",
      });
    }
  };

  const handlePaymentFormSubmit = async (data: {payments: PaymentData[]}) => {
    if (!ticketId) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Сначала создайте турпакет",
      });
      return;
    }
    
    const ticketPrice = Number(form.getValues('grossPrice'));
    await handlePaymentSubmit(ticketId, ticketPrice, data.payments);
  };
  
  const handlePaymentChange = (data: {payments: PaymentData[]}) => {
    setPayments(data.payments);
  };

  if (!ticketId) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Оформление турпакета</h1>
          <p className="text-muted-foreground mt-2">
            Заполните информацию о турпакете
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Информация о турпакете</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Поставщик</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Номер заказа</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="netPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Стоимость нетто</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grossPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Стоимость брутто</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Создание турпакета...
                    </>
                  ) : (
                    'Продолжить к оплате'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Оплата турпакета</h1>
        <p className="text-muted-foreground mt-2">
          Укажите информацию об оплате
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Оплата</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiplePaymentsForm
            totalAmount={Number(form.getValues('grossPrice'))}
            onSubmit={handlePaymentFormSubmit}
            isSubmitting={isSubmitting}
            onChange={handlePaymentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
