import { Agent } from "@/lib/types";

// Keep only agents data since we haven't moved it to the database yet
export const agents: Agent[] = [
  {
    id: "agent-1",
    name: "John Smith",
    email: "john.smith@skytrack.com",
    role: "agent"
  },
  {
    id: "agent-2",
    name: "Jane Doe",
    email: "jane.doe@skytrack.com",
    role: "agent"
  },
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@skytrack.com",
    role: "admin"
  }
];

export const getCurrentAgent = (): Agent => {
  return agents[0];
};
