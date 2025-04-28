
import { useState } from "react";
import { useAgents } from "@/hooks/use-agents";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, FileText, Edit, Trash2 } from "lucide-react";
import { AgentForm } from "./AgentForm";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AgentTable() {
  const { data: agents = [], isLoading, refetch } = useAgents();
  const [agentList, setAgentList] = useState(agents);

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")  // Changed from "agents" to "profiles"
        .delete()
        .eq("id", agentId);

      if (error) throw error;

      setAgentList(agentList.filter(agent => agent.id !== agentId));
      refetch(); // Refresh the agents list
      
      toast({
        title: "Agent deleted",
        description: "The agent has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        title: "Error",
        description: "Failed to delete the agent. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agentList.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {agent.id.substring(0, 8)}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{agent.email}</TableCell>
              <TableCell>
                <Badge variant={agent.role === "admin" ? "default" : "secondary"}>
                  {agent.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                  Active
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      View Reports
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <AgentForm mode="edit" agent={agent} trigger={
                        <div className="flex items-center w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Agent
                        </div>
                      } />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex items-center w-full cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Agent
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the agent
                              account and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDeleteAgent(agent.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
