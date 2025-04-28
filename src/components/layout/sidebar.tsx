
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plane, Menu } from "lucide-react";
import { Navigation } from "./Navigation";
import { UserProfile } from "./UserProfile";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" />
          {!isCollapsed && (
            <h1 className="text-lg font-semibold">SkyTrack Pro</h1>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <Navigation isCollapsed={isCollapsed} />
      </div>

      <div className="border-t p-4">
        <UserProfile isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}

export { MobileNav, MobileBottomNav } from "./MobileNavigation";
