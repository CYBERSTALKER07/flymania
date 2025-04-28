
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Plane } from "lucide-react";

export function SplashScreen() {
  const [show, setShow] = useState(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    if (!hasVisited) {
      localStorage.setItem("hasVisitedBefore", "true");
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center bg-background transition-opacity duration-1000 z-50",
        !show && "opacity-0 pointer-events-none"
      )}
      style={{
        background: `linear-gradient(135deg, 
          hsl(234.5 89.5% 73.9%) 0%,
          hsl(234.5 89.5% 73.9%) 33%,
          hsl(229.7 93.5% 81.8%) 66%,
          hsl(187.9 85.7% 53.3%) 100%
        )`
      }}
    >
      <div className="text-center">
        <div className="relative mb-3">
          <Plane 
            className="h-20 w-20 text-white animate-float rotate-[35deg]" 
            strokeWidth={1.5}
          />
          <div className="absolute h-6 w-36 bg-white/10 rounded-full blur-lg -bottom-2 left-1/2 transform -translate-x-1/2 animate-pulse-slow"></div>
        </div>
        <h1 className="text-3xl font-bold text-white animate-fade-in mt-6">
          SkyTrack Pro
        </h1>
        <p className="text-white/90 mt-2 animate-slide-up delay-300">Airline Ticket Management System</p>
      </div>
    </div>
  );
}
