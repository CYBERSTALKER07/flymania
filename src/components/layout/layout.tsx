
import { Outlet } from "react-router-dom";
import { Sidebar, MobileNav, MobileBottomNav } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/ui/theme-provider";

export function Layout() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <MobileNav />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
            <Outlet />
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </ThemeProvider>
  );
}
