export type Airport = {
  iataCode: string;
  city: string;
  country: string;
  name: string;
  state?: string;
};

export type Airline = {
  iataCode: string;
  name: string;
  country: string;
};

export type Agent = {
  id: string;
  name: string;
  email: string;
  commissionRate?: number;
  role: 'agent' | 'admin';
};

export type PrepaidClient = {
  id: string;
  agent_id: string;
  agent_name: string;
  client_name: string;
  amount: number;
  payment_date: string;
  created_at: string;
  notes?: string;
  payment_method: 'cash' | 'bank_transfer' | 'visa' | 'uzcard';
};

export type SupplierRevenue = {
  supplier: string;
  revenue: number;
  name: string;
  count: number;
};

export type MonthlyData = {
  month: string;
  revenue: number;
  count: number;
};

export type Payment = {
  id: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'visa' | 'uzcard' | 'terminal';
  paymentDate: string;
  ticketId?: string;
};

export type Ticket = {
  id: string;
  passengerName: string;
  origin: Airport;
  destination: Airport;
  airline: Airline;
  travelDate: string;
  price: number;
  issueDate: string;
  agentId: string;
  agentName: string;
  basePrice?: number;
  fees?: number;
  commissionRate?: number;
  serviceType?: "flight" | "tour" | "insurance" | "seat" | "baggage" | "train" | "other";
  supplier?: string;
  paymentStatus?: 'pending' | 'paid';
  paymentMethod?: 'cash' | 'bank_transfer' | 'visa' | 'uzcard' | 'terminal';
  paymentDate?: string;
  returnDate?: string;
  contactInfo?: string;
  comments?: string;
  orderNumber?: string;
  payments?: Payment[];
  originalPrice?: number;
};

export type Expense = {
  id?: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'visa' | 'uzcard' | 'terminal';
  commentary?: string;
  created_at?: string;
};

export type Consumption = {
  id?: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'visa' | 'uzcard' | 'terminal';
  commentary?: string;
  created_at?: string;
};
