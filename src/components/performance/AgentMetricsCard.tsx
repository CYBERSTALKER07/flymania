
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { DoughnutChart } from "@/components/ui/doughnut-chart";
import { BarChart } from "@/components/ui/bar-chart";
import { useAgents } from "@/hooks/use-agents";
import { useTickets } from "@/hooks/use-tickets";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Users, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportOperatorPerformanceToExcel } from "@/lib/excel-export";

const serviceTypeColors = {
  flight: "sky",
  tour: "emerald",
  insurance: "indigo",
  seat: "amber",
  baggage: "rose",
};

interface AgentMetricsCardProps {
  agent?: any;
  rank?: number;
}

export function AgentMetricsCard({ agent, rank }: AgentMetricsCardProps = {}) {
  const { data: agents = [] } = useAgents();
  const { data: tickets = [] } = useTickets();
  
  const handleExportOperatorPerformance = () => {
    // Calculate performance metrics for each agent
    const operatorData = agents.map(agent => {
      const agentTickets = tickets.filter(t => t.agentId === agent.id);
      const flightCount = agentTickets.filter(t => t.serviceType === 'flight').length;
      const tourCount = agentTickets.filter(t => t.serviceType === 'tour').length;
      const insuranceCount = agentTickets.filter(t => t.serviceType === 'insurance').length;
      const seatCount = agentTickets.filter(t => t.serviceType === 'seat').length;
      const baggageCount = agentTickets.filter(t => t.serviceType === 'baggage').length;
      
      const totalRevenue = agentTickets.reduce((sum, ticket) => sum + ticket.price, 0);
      const totalCount = agentTickets.length;
      const avgTicketPrice = totalCount > 0 ? totalRevenue / totalCount : 0;
      
      return {
        name: agent.name,
        flightCount,
        tourCount,
        insuranceCount,
        seatCount,
        baggageCount,
        totalCount,
        totalRevenue,
        avgTicketPrice,
        commissionRate: agent.commissionRate
      };
    });

    exportOperatorPerformanceToExcel(operatorData);
  };

  // If agent prop is provided, render simplified agent card
  if (agent) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            {rank && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {rank}
              </div>
            )}
            <div>
              <h3 className="font-medium">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">
                {agent.totalCount} продаж | {new Intl.NumberFormat('ru-RU', { 
                  style: 'currency', 
                  currency: 'RUB',
                  maximumFractionDigits: 0 
                }).format(agent.totalRevenue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Metrics</CardTitle>
          <CardDescription>Metrics about agent performance</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No agent data available.</p>
        </CardContent>
      </Card>
    );
  }

  const totalSales = tickets.length;
  const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

  // Calculate service type distribution
  const serviceTypeData = Object.entries(serviceTypeColors).map(([type, color]) => ({
    name: type,
    value: tickets.filter((ticket) => ticket.serviceType === type).length,
    color: `var(--${color})`,
  }));

  // Calculate sales per agent
  const salesPerAgent = agents.map((agent) => ({
    name: agent.name,
    sales: tickets.filter((ticket) => ticket.agentId === agent.id).length,
  }));

  // Find best and worst performing agents
  const sortedAgents = [...salesPerAgent].sort((a, b) => b.sales - a.sales);
  const bestPerformingAgent = sortedAgents[0];
  const worstPerformingAgent = sortedAgents[sortedAgents.length - 1];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            Agent Performance Metrics
          </CardTitle>
          <CardDescription>Metrics about agent performance</CardDescription>
        </div>
        <Button size="sm" onClick={handleExportOperatorPerformance}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Agents"
            value={agents.length.toString()}
            icon={Users}
          />
          <MetricCard
            title="Total Sales"
            value={totalSales.toString()}
            // change="+12%"
            // changeType="increase"
          />
          <MetricCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            // change="-$50"
            // changeType="decrease"
          />
          <MetricCard
            title="Avg. Sales per Agent"
            value={(totalSales / agents.length).toFixed(2)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Type Distribution</CardTitle>
              <CardDescription>Distribution of service types sold</CardDescription>
            </CardHeader>
            <CardContent>
              <DoughnutChart data={serviceTypeData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales per Agent</CardTitle>
              <CardDescription>Number of sales per agent</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={salesPerAgent} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Best Performing Agent</CardTitle>
              <CardDescription>Agent with the most sales</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <div className="text-lg font-bold">{bestPerformingAgent?.name}</div>
              <Badge variant="outline">
                <ArrowUp className="h-4 w-4 mr-2" />
                {bestPerformingAgent?.sales} Sales
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Worst Performing Agent</CardTitle>
              <CardDescription>Agent with the least sales</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <div className="text-lg font-bold">{worstPerformingAgent?.name}</div>
              <Badge variant="outline">
                <ArrowDown className="h-4 w-4 mr-2" />
                {worstPerformingAgent?.sales} Sales
              </Badge>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
