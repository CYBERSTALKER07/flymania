
import { Routes, Route } from "react-router-dom";
import { ServiceTypeSelection } from "@/components/sales/ServiceTypeSelection";
import { TicketTypeSelection } from "@/components/ticket-sales/TicketTypeSelection";
import { OneWayTicketForm } from "@/components/ticket-sales/OneWayTicketForm";
import { RoundTripTicketForm } from "@/components/ticket-sales/RoundTripTicketForm";
import { MultiCityTicketForm } from "@/components/ticket-sales/MultiCityTicketForm";
import { TourTypeSelection } from "@/components/tours/TourTypeSelection";
import { PackageTourForm } from "@/components/tours/PackageTourForm";
import { CustomTourForm } from "@/components/tours/CustomTourForm";
import { AdditionalServicesSelection } from "@/components/additional-services/AdditionalServicesSelection";
import { TrainTicketForm } from "@/components/additional-services/TrainTicketForm";
import { InsuranceForm } from "@/components/additional-services/InsuranceForm";
import { OtherServicesForm } from "@/components/additional-services/OtherServicesForm";
import { UnpaidPayments } from "@/components/additional-services/payments/UnpaidPayments";
import { PaidPayments } from "@/components/additional-services/payments/PaidPayments";
import { PrepaidPayments } from "@/components/additional-services/prepaid/PrepaidPayments";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function SellTicket() {
  const { toast } = useToast();
  const location = useLocation();

  // Clear any stale error states when navigating between different forms
  useEffect(() => {
    // Reset any global form errors when changing routes
    console.log("Route changed in SellTicket: ", location.pathname);
  }, [location.pathname]);

  // Handle global error recovery
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [toast]);

  return (
    <div className="container py-6">
      <Routes>
        <Route index element={<ServiceTypeSelection />} />
        <Route path="tickets" element={<TicketTypeSelection />} />
        <Route path="tickets/one-way" element={<OneWayTicketForm />} />
        <Route path="tickets/round-trip" element={<RoundTripTicketForm />} />
        <Route path="tickets/multi-city" element={<MultiCityTicketForm />} />
        <Route path="tours" element={<TourTypeSelection />} />
        <Route path="tours/package" element={<PackageTourForm />} />
        <Route path="tours/custom" element={<CustomTourForm />} />
        <Route path="additional-services" element={<AdditionalServicesSelection />} />
        <Route path="additional-services/train" element={<TrainTicketForm />} />
        <Route path="additional-services/insurance" element={<InsuranceForm />} />
        <Route path="additional-services/other" element={<OtherServicesForm />} />
        <Route path="unpaid-payments" element={<UnpaidPayments />} />
        <Route path="paid-payments" element={<PaidPayments />} />
        <Route path="prepaid" element={<PrepaidPayments />} />
      </Routes>
    </div>
  );
}
