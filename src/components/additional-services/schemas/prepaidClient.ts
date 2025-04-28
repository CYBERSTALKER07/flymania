
import * as z from "zod";

export const PrepaidClientSchema = z.object({
  client_name: z.string().min(2, { message: "Имя клиента обязательно" }),
  amount: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Введите корректную сумму" }),
  payment_method: z.enum(['cash', 'bank_transfer', 'visa', 'uzcard']),
  notes: z.string().optional(),
});
