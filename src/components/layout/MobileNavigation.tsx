
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Plane } from "lucide-react";
import { UserProfile } from "./UserProfile";
import { Navigation } from "./Navigation";
import { navItems } from "@/config/navigation";

export function MobileNav() {
  const { user } = useAuth();
  
  return (
    <div className="md:hidden">
      <div className="flex h-14 items-center border-b px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] px-0">
            <div className="flex h-14 items-center border-b px-4">
              <div className="flex items-center gap-2">
                <Plane className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold">SkyTrack Pro</h1>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <Navigation />
            </div>
            <div className="border-t p-4">
              <UserProfile />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 mx-auto">
          <Plane className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">SkyTrack Pro</h1>
        </div>
      </div>
    </div>
  );
}

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.email === "cyerstalekr@gmail.com";
  
  const filteredBottomNavItems = navItems
    .filter(item => item.showFor === "all" || (item.showFor === "admin" && isAdmin))
    .slice(0, 4);

  const activeIndex = filteredBottomNavItems.findIndex(item => item.path === location.pathname);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-indigo-500 z-50">
      <nav className="relative flex justify-around">
        {filteredBottomNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center py-2 px-3 transition-colors",
              location.pathname === item.path
                ? "text-white"
                : "text-white opacity-70 hover:opacity-105"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                location.pathname === item.path
                  ? "bg-yellow-500 text-indigo-500"
                  : "bg-transparent text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
