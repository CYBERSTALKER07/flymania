
import React, { useState } from "react";
import { Ticket } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MultiplePaymentsForm } from "@/components/payments/MultiplePaymentsForm";
import { useTicketPayment, PaymentData } from "@/hooks/use-ticket-payment";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface PaymentEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: Ticket | null;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export function PaymentEditDialog({ 
  isOpen, 
  onClose, 
  selectedTicket, 
  onSubmit,
  isSubmitting = false
}: PaymentEditDialogProps) {
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  
  const handlePaymentChange = (data: { payments: PaymentData[] }) => {
    setPaymentData(data.payments);
  };

  const handleSubmit = () => {
    if (!paymentData.length) {
      toast({
        title: "Ошибка",
        description: "Введите хотя бы одну сумму оплаты",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({ payments: paymentData });
  };

  if (!selectedTicket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Обновление оплаты</DialogTitle>
          <DialogDescription>
            Введите информацию об оплате для выбранного билета или услуги
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <p><span className="font-medium">Клиент:</span> {selectedTicket.passengerName}</p>
            <p><span className="font-medium">Услуга:</span> {selectedTicket.serviceType || "Билет"}</p>
            <p><span className="font-medium">Полная стоимость:</span> {selectedTicket.price.toLocaleString()} UZS</p>
            {selectedTicket.payments && selectedTicket.payments.length > 0 && (
              <p>
                <span className="font-medium">Уже оплачено:</span> {
                  selectedTicket.payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()
                } UZS
              </p>
            )}
          </div>

          <MultiplePaymentsForm
            totalAmount={selectedTicket.price}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            initialPayments={selectedTicket.payments}
            onChange={handlePaymentChange}
          />

          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !paymentData.length}
            >
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
