
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme-toggle";

interface UserProfileProps {
  isCollapsed?: boolean;
}

export function UserProfile({ isCollapsed }: UserProfileProps) {
  const { user } = useAuth();

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <span className="text-xs font-medium">
            {user?.email?.substring(0, 2).toUpperCase() || "AG"}
          </span>
        </div>
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <span className="text-xs font-medium">
            {user?.email?.substring(0, 2).toUpperCase() || "AG"}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium">
            {user?.email === "cyerstalekr@gmail.com" ? "Admin" : "Agent"}
          </p>
          <p className="text-xs text-muted-foreground">
            {user?.email || "Agent ID"}
          </p>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
