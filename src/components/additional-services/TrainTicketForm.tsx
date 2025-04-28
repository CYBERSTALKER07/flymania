
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
  price: z.string().min(1, "Стоимость обязательна"),
});

export function TrainTicketForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  
  const { 
    isSubmitting, 
    handlePaymentsChange, 
    handlePaymentSubmit,
  } = useTicketPayment({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Ж/Д билет успешно оформлен",
      });
      navigate('/');
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: "",
      price: "",
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
        service_type: 'train',
        train_supplier: values.supplier,
        train_price: Number(values.price),
        issue_date: new Date().toISOString(),
        travel_date: new Date().toISOString(),
        passenger_name: "Train Ticket",
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
        price: Number(values.price),
        payment_status: 'pending',
      }).select();

      if (error) throw error;
      
      if (data && data[0]) {
        setTicketId(data[0].id);
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Произошла ошибка при оформлении Ж/Д билета",
      });
    }
  };

  const handlePaymentFormSubmit = async (data: {payments: PaymentData[]}) => {
    if (!ticketId) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Сначала создайте билет",
      });
      return;
    }
    
    const ticketPrice = Number(form.getValues('price'));
    await handlePaymentSubmit(ticketId, ticketPrice, data.payments);
  };
  
  const handlePaymentChange = (data: {payments: PaymentData[]}) => {
    setPayments(data.payments);
  };

  if (!ticketId) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Оформление Ж/Д билета</h1>
          <p className="text-muted-foreground mt-2">
            Заполните информацию о Ж/Д билете
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Информация о билете</CardTitle>
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Стоимость</FormLabel>
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
                      Создание билета...
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
        <h1 className="text-3xl font-bold">Оплата Ж/Д билета</h1>
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
            totalAmount={Number(form.getValues('price'))}
            onSubmit={handlePaymentFormSubmit}
            isSubmitting={isSubmitting}
            onChange={handlePaymentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
