
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

export function CreateAgentForm() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [role, setRole] = useState<"agent" | "admin">("agent");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        title: "Success",
        description: "Agent created successfully",
      });

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setCommissionRate("");
      setRole("agent");
    } catch (error: any) {
      console.error("Error creating agent:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create agent",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Agent</CardTitle>
          <CardDescription>
            Add a new agent to the system. They will be able to log in using these credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

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

            <Button type="submit" disabled={loading} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Agent"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
