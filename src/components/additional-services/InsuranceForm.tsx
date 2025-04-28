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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  supplier: z.string().min(1, "Поставщик обязателен"),
  price: z.string().min(1, "Стоимость обязательна"),
  paid: z.string().min(1, "Сумма оплаты обязательна"),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'visa', 'uzcard'], {
    required_error: "Выберите метод оплаты"
  }),
  paymentStatus: z.enum(['pending', 'paid'], {
    required_error: "Выберите статус оплаты"
  })
});

export function InsuranceForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: "",
      price: "",
      paid: "",
      paymentMethod: "cash",
      paymentStatus: "pending"
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
        service_type: 'insurance',
        insurance_supplier: values.supplier,
        insurance_price: Number(values.price),
        insurance_paid: Number(values.paid),
        issue_date: new Date().toISOString(),
        travel_date: new Date().toISOString(),
        passenger_name: "Insurance",
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
        payment_method: values.paymentMethod,
        payment_status: values.paymentStatus,
        payment_date: values.paymentStatus === 'paid' ? new Date().toISOString() : null
      }).select();

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Страховка успешно оформлена",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Произошла ошибка при оформлении страховки",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Оформление страховки</h1>
        <p className="text-muted-foreground mt-2">
          Заполните информацию о страховке
        </p>
      </div>

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

          <FormField
            control={form.control}
            name="paid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Оплачено</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Метод оплаты</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите метод оплаты" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Наличный</SelectItem>
                      <SelectItem value="bank_transfer">Банковский перевод</SelectItem>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="uzcard">UzCard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
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
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Оформление...
              </>
            ) : (
              'Оформить страховку'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
