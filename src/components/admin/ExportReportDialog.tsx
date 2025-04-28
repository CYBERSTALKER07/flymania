
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTickets } from "@/hooks/use-tickets";
import { exportTicketsToExcel } from "@/lib/excel-export";

interface ExportReportDialogProps {
  agentId: string | "all";
  timeRange: string;
}

export function ExportReportDialog({ agentId, timeRange }: ExportReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState("xlsx");
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const { toast } = useToast();
  const { data: tickets = [] } = useTickets();
  
  const handleExport = () => {
    try {
      // Filter tickets by agent if needed
      const filteredTickets = agentId === "all" 
        ? tickets 
        : tickets.filter(ticket => ticket.agentId === agentId);
      
      // Export the filtered tickets
      exportTicketsToExcel(filteredTickets, `tickets-${agentId === "all" ? "all-agents" : `agent-${agentId}`}`);
      
      toast({
        title: "Отчет успешно экспортирован",
        description: "Файл с отчетом сохранен на ваш компьютер",
      });
      
      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Ошибка при экспорте",
        description: "Не удалось создать отчет. Пожалуйста, попробуйте еще раз.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Configure your report export options.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="format">File Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Report Contents</Label>
            
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox 
                id="include-details" 
                checked={includeDetails} 
                onCheckedChange={() => setIncludeDetails(!includeDetails)} 
              />
              <Label htmlFor="include-details" className="text-sm">Include ticket details</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-summary" 
                checked={includeSummary} 
                onCheckedChange={() => setIncludeSummary(!includeSummary)} 
              />
              <Label htmlFor="include-summary" className="text-sm">Include summary statistics</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-charts" 
                checked={includeCharts} 
                onCheckedChange={() => setIncludeCharts(!includeCharts)} 
              />
              <Label htmlFor="include-charts" className="text-sm">Include charts and visualizations</Label>
            </div>
          </div>
          
          <div className="space-y-1 text-sm">
            <p className="font-medium">Export scope:</p>
            <p className="text-muted-foreground">
              {agentId === "all" ? "All agents" : "Single agent"} • {
                timeRange === "week" ? "Last 7 days" :
                timeRange === "month" ? "Last 30 days" :
                timeRange === "quarter" ? "Last 90 days" : "Last 12 months"
              }
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
