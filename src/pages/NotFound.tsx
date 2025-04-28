import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plane, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="relative mb-6">
          <Plane 
            className="h-24 w-24 text-primary/40 rotate-[35deg] animate-pulse-slow" 
            strokeWidth={1.5}
          />
          <div className="absolute h-8 w-32 bg-primary/10 rounded-full blur-lg -bottom-2 left-1/2 transform -translate-x-1/2"></div>
        </div>
        
        <h1 className="text-8xl font-bold bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Flight Not Found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't locate the destination you're looking for. This route doesn't exist or has been canceled.
          </p>
        </div>
        
        <Button asChild className="mt-6" size="lg">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
