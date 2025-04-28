
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { navItems } from "@/config/navigation";

interface NavigationProps {
  isCollapsed?: boolean;
}

export function Navigation({ isCollapsed }: NavigationProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.email === "cyerstalekr@gmail.com";
  
  const filteredNavItems = navItems.filter(item => 
    item.showFor === "all" || (item.showFor === "admin" && isAdmin)
  );

  return (
    <nav className="grid gap-1 px-2">
      {filteredNavItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
            location.pathname === item.path
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          {!isCollapsed && <span>{item.name}</span>}
        </Link>
      ))}
    </nav>
  );
}
