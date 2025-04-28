
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/hooks/use-tickets";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileSpreadsheet, Search, SlidersHorizontal, X, Info, Plane } from "lucide-react";
import { Ticket } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function SoldTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [viewType, setViewType] = useState<"all" | "mine">("mine");
  
  const { user } = useAuth();
  const { data: tickets = [], isLoading, error } = useTickets();
  const { toast } = useToast();
  
  // Log information to help with debugging
  console.log("User:", user);
  console.log("Tickets loaded:", tickets.length);
  console.log("Loading state:", isLoading);
  console.log("Error:", error);
  
  // Filter tickets based on the selected view type
  const displayTickets = viewType === "all" ? tickets : tickets.filter(ticket => ticket.agentId === user?.id);
  
  // Filter tickets based on search term
  const filteredTickets = displayTickets.filter(
    (ticket) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        ticket.passengerName.toLowerCase().includes(searchLower) ||
        ticket.origin.iataCode.toLowerCase().includes(searchLower) ||
        ticket.destination.iataCode.toLowerCase().includes(searchLower) ||
        ticket.airline.name.toLowerCase().includes(searchLower) ||
        ticket.airline.iataCode.toLowerCase().includes(searchLower)
      );
    }
  );

  const handleExportToExcel = () => {
    // In a real app, this would use the xlsx package to export data
    console.log("Exporting to Excel:", filteredTickets);
    toast({
      title: "Export Started",
      description: "Your data is being prepared for export.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Return the original string if formatting fails
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="text-destructive mb-4">
            <X className="h-8 w-8 mx-auto" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Error Loading Tickets</h2>
          <p className="text-muted-foreground mb-4">
            There was a problem loading your tickets. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Проданные билеты</h1>
          <p className="text-muted-foreground">
            Просмотр и управление всеми проданными билетами
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Экспорт в Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
            <div className="flex items-center gap-4">
              <Tabs defaultValue={viewType} className="w-[260px]" onValueChange={(value) => setViewType(value as "all" | "mine")}>
                <TabsList>
                  <TabsTrigger value="mine">Мои билеты</TabsTrigger>
                  <TabsTrigger value="all">Все билеты</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="text-sm text-muted-foreground">
                {filteredTickets.length} {filteredTickets.length === 1 ? 'билет' : filteredTickets.length >= 2 && filteredTickets.length <= 4 ? 'билета' : 'билетов'}
              </div>
            </div>
            
            <div className="w-full md:w-auto flex items-center gap-2">
              <div className="relative w-full md:w-[260px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск билетов..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full aspect-square"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button variant="outline" size="icon" title="Расширенные фильтры">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пассажир</TableHead>
                    <TableHead>Маршрут</TableHead>
                    <TableHead>Авиакомпания</TableHead>
                    <TableHead>Дата полета</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Дата выдачи</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Билеты не найдены. Попробуйте другой поисковый запрос.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <TableRow 
                        key={ticket.id} 
                        className="cursor-pointer hover:bg-accent/20 transition-colors"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <TableCell className="font-medium">{ticket.passengerName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{ticket.origin.iataCode}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                              <path d="M16.5 9.5L7.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16.5 14.5L7.5 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="font-medium">{ticket.destination.iataCode}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{ticket.airline.iataCode}</span>
                            <span className="text-muted-foreground text-xs">({ticket.airline.name})</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(ticket.travelDate)}</TableCell>
                        <TableCell>{formatCurrency(ticket.price)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(ticket.issueDate)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Детали билета</DialogTitle>
            <DialogDescription>
              Полная информация о выбранном билете
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Passenger</p>
                  <p className="text-xl font-semibold">{selectedTicket.passengerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Price</p>
                  <p className="text-xl font-semibold">{formatCurrency(selectedTicket.price)}</p>
                </div>
              </div>
              
              <div className="relative pb-8">
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[calc(100%-8rem)] h-[1px] bg-border"></div>
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                  <div className="bg-card rounded-full p-2 shadow-sm border">
                    <Plane className="h-6 w-6 text-primary rotate-90" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-right space-y-1">
                    <div className="text-2xl font-bold">{selectedTicket.origin.iataCode}</div>
                    <div className="text-sm font-medium">{selectedTicket.origin.city}</div>
                    <div className="text-xs text-muted-foreground">{selectedTicket.origin.name}</div>
                  </div>
                  <div className="text-left space-y-1">
                    <div className="text-2xl font-bold">{selectedTicket.destination.iataCode}</div>
                    <div className="text-sm font-medium">{selectedTicket.destination.city}</div>
                    <div className="text-xs text-muted-foreground">{selectedTicket.destination.name}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Airline</p>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium">{selectedTicket.airline.name}</span>
                    <span className="text-sm text-muted-foreground">({selectedTicket.airline.iataCode})</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Travel Date</p>
                  <p className="text-base font-medium">{formatDate(selectedTicket.travelDate)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="text-base font-medium">{formatDate(selectedTicket.issueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issued By</p>
                  <p className="text-base font-medium">{selectedTicket.agentName}</p>
                </div>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  handleExportToExcel();
                  toast({
                    title: "Ticket Exported",
                    description: "The selected ticket has been exported."
                  });
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Ticket
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
