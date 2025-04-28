
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Ticket, Airport, Airline, Payment } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Function to get the color class based on ticket price
export const getTicketPriceColorClass = (price: number): string => {
  if (price <= 200) return "text-cyan-300";
  if (price <= 400) return "text-sky-400";  
  if (price <= 600) return "text-blue-300";
  if (price <= 800) return "text-blue-200";
  if (price <= 1000) return "text-indigo-400";
  return "text-indigo-200";
};

export const useTickets = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        }, 
        (payload) => {
          console.log("Real-time update received:", payload);
          // Invalidate and refetch tickets when changes occur
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
        }
      )
      .subscribe((status) => {
        console.log("Supabase channel status:", status);
      });

    return () => {
      console.log("Cleaning up Supabase channel");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      try {
        console.log("Fetching tickets from Supabase...");
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select("*")
          .order("created_at", { ascending: false });

        if (ticketsError) {
          console.error("Error fetching tickets:", ticketsError);
          toast({
            title: "Error fetching tickets",
            description: ticketsError.message,
            variant: "destructive",
          });
          throw ticketsError;
        }
        
        console.log("Tickets fetched successfully:", ticketsData?.length || 0);
        
        // Transform tickets and fetch payments for each ticket
        const transformedTickets = await Promise.all((ticketsData || []).map(async (ticket) => {
          // Fetch payments for this ticket
          const { data: paymentsData, error: paymentsError } = await supabase
            .from("ticket_payments")
            .select("*")
            .eq("ticket_id", ticket.id);
            
          if (paymentsError) {
            console.error(`Error fetching payments for ticket ${ticket.id}:`, paymentsError);
          }
          
          // Transform payments data
          const payments = (paymentsData || []).map(payment => ({
            id: payment.id,
            amount: payment.amount,
            paymentMethod: payment.payment_method,
            paymentDate: payment.payment_date || payment.created_at
          })) as Payment[];
          
          // Transform the database schema to match our application types
          return {
            id: ticket.id,
            passengerName: ticket.passenger_name,
            origin: {
              iataCode: ticket.origin_code,
              city: ticket.origin_city,
              country: ticket.origin_country,
              name: ticket.origin_name
            } as Airport,
            destination: {
              iataCode: ticket.destination_code,
              city: ticket.destination_city,
              country: ticket.destination_country,
              name: ticket.destination_name
            } as Airport,
            airline: {
              iataCode: ticket.airline_code,
              name: ticket.airline_name,
              country: ticket.airline_country
            } as Airline,
            travelDate: ticket.travel_date,
            price: ticket.price,
            issueDate: ticket.issue_date,
            agentId: ticket.agent_id,
            agentName: ticket.agent_name,
            basePrice: ticket.base_price,
            fees: ticket.fees,
            commissionRate: ticket.commission_rate,
            serviceType: ticket.service_type,
            supplier: ticket.supplier,
            priceColorClass: getTicketPriceColorClass(ticket.price),
            paymentStatus: ticket.payment_status,
            paymentMethod: ticket.payment_method,
            paymentDate: ticket.payment_date,
            payments: payments,
            orderNumber: ticket.order_number,
            contactInfo: ticket.contact_info,
            comments: ticket.comments
          };
        })) as (Ticket & { priceColorClass: string })[];
        
        return transformedTickets;
      } catch (error) {
        console.error("Error in useTickets hook:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  // Add a mutation for creating tickets
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: Partial<Ticket>) => {
      try {
        console.log("Creating new ticket:", ticketData);
        
        // Transform the ticket data to match database schema
        const dbTicket = {
          passenger_name: ticketData.passengerName,
          origin_code: ticketData.origin?.iataCode,
          origin_city: ticketData.origin?.city,
          origin_country: ticketData.origin?.country,
          origin_name: ticketData.origin?.name,
          destination_code: ticketData.destination?.iataCode,
          destination_city: ticketData.destination?.city,
          destination_country: ticketData.destination?.country,
          destination_name: ticketData.destination?.name,
          airline_code: ticketData.airline?.iataCode,
          airline_name: ticketData.airline?.name,
          airline_country: ticketData.airline?.country,
          travel_date: ticketData.travelDate,
          price: ticketData.price,
          agent_id: ticketData.agentId,
          agent_name: ticketData.agentName,
          base_price: ticketData.basePrice,
          fees: ticketData.fees,
          commission_rate: ticketData.commissionRate,
          service_type: ticketData.serviceType,
          supplier: ticketData.supplier,
          payment_status: ticketData.paymentStatus || 'pending',
          payment_method: ticketData.paymentMethod,
          payment_date: ticketData.paymentDate,
          order_number: ticketData.orderNumber,
          contact_info: ticketData.contactInfo,
          comments: ticketData.comments
        };

        const { data, error } = await supabase
          .from("tickets")
          .insert(dbTicket)
          .select()
          .single();

        if (error) {
          console.error("Error creating ticket:", error);
          throw error;
        }

        console.log("Ticket created successfully:", data);
        return data;
      } catch (error: any) {
        console.error("Error in createTicket mutation:", error);
        throw new Error(`Failed to create ticket: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  return {
    ...query,
    createTicket: createTicketMutation.mutateAsync,
    isCreating: createTicketMutation.isPending,
    refetch: async () => {
      console.log("Manual refetch of tickets triggered");
      const result = await query.refetch();
      console.log("Manual refetch completed, tickets count:", result.data?.length || 0);
      return result;
    }
  };
};

export const useAgentTickets = (agentId: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["tickets", agentId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("agent_id", agentId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        // Transform the database schema to match our application types
        return (data || []).map(ticket => ({
          id: ticket.id,
          passengerName: ticket.passenger_name,
          origin: {
            iataCode: ticket.origin_code,
            city: ticket.origin_city,
            country: ticket.origin_country,
            name: ticket.origin_name
          } as Airport,
          destination: {
            iataCode: ticket.destination_code,
            city: ticket.destination_city,
            country: ticket.destination_country,
            name: ticket.destination_name
          } as Airport,
          airline: {
            iataCode: ticket.airline_code,
            name: ticket.airline_name,
            country: ticket.airline_country
          } as Airline,
          travelDate: ticket.travel_date,
          price: ticket.price,
          issueDate: ticket.issue_date,
          agentId: ticket.agent_id,
          agentName: ticket.agent_name,
          priceColorClass: getTicketPriceColorClass(ticket.price),
          paymentStatus: ticket.payment_status,
          paymentMethod: ticket.payment_method,
          orderNumber: ticket.order_number
        })) as (Ticket & { priceColorClass: string })[];
      } catch (error) {
        console.error("Error in useAgentTickets hook:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated && !!agentId
  });
};
