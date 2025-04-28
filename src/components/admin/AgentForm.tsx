
import { useState } from "react";
import { Agent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AgentFormProps {
  mode: 'create' | 'edit';
  agent?: Agent;
  trigger?: React.ReactNode;
}

export function AgentForm({ mode, agent, trigger }: AgentFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(agent?.name || "");
  const [email, setEmail] = useState(agent?.email || "");
  const [password, setPassword] = useState("");
  const [commissionRate, setCommissionRate] = useState<string>(
    agent?.commissionRate?.toString() || ""
  );
  const [role, setRole] = useState<"agent" | "admin">(agent?.role || "agent");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'create') {
        console.log("Creating agent with params:", {
          email,
          name,
          commissionRate: parseFloat(commissionRate),
          role
        });
        
        const { data, error } = await supabase.functions.invoke("create_agent_with_password", {
          body: {
            _email: email,
            _password: password,
            _name: name,
            _commission_rate: parseFloat(commissionRate),
            _role: role
          }
        });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        toast({
          title: "Agent created",
          description: "The new agent has been successfully created.",
        });
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            name,
            email,
            commission_rate: parseFloat(commissionRate),
            role
          })
          .eq('id', agent?.id);

        if (error) throw error;

        toast({
          title: "Agent updated",
          description: "The agent has been successfully updated.",
        });
      }
      
      setOpen(false);
      
      if (mode === 'create') {
        setName("");
        setEmail("");
        setPassword("");
        setCommissionRate("");
        setRole("agent");
      }
    } catch (error: any) {
      console.error("Error with agent operation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred",
      });
    }
  };

  const defaultTrigger = mode === 'create' ? (
    <Button>
      <UserPlus className="h-4 w-4 mr-2" />
      Add New Agent
    </Button>
  ) : (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
      <Edit className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Agent' : 'Edit Agent'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Enter the details for the new agent.' 
              : 'Update the agent\'s information.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="john.doe@example.com"
                required
              />
            </div>

            {mode === 'create' && (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required={mode === 'create'}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="commission">Commission Rate (%)</Label>
              <Input 
                id="commission" 
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={commissionRate} 
                onChange={(e) => setCommissionRate(e.target.value)} 
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={role} 
                onValueChange={(value) => setRole(value as "agent" | "admin")}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create Agent' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
