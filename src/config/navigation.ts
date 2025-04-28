
import { 
  Home, 
  TicketIcon, 
  FileText, 
  BarChart3, 
  Plus,
  Wallet 
} from "lucide-react";

export type NavItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  showFor: "all" | "admin";
};

export const navItems: NavItem[] = [
  { 
    name: "Главная", 
    path: "/", 
    icon: Home,
    showFor: "all"
  },
  { 
    name: "Продать билет", 
    path: "/sell-ticket", 
    icon: TicketIcon,
    showFor: "all" 
  },
  { 
    name: "Проданные билеты", 
    path: "/sold-tickets", 
    icon: FileText,
    showFor: "all"
  },
  { 
    name: "Панель администратора", 
    path: "/admin", 
    icon: BarChart3,
    showFor: "all"
  },
  { 
    name: "Предоплаты", 
    path: "/sell-ticket/prepaid", 
    icon: Plus,
    showFor: "all"
  },
  { 
    name: "Расширенная аналитика", 
    path: "/advanced-analytics", 
    icon: BarChart3,
    showFor: "admin"
  },
  { 
    name: "Расходы", 
    path: "/expenses", 
    icon: Wallet,
    showFor: "all"
  },
  { 
    name: "Потребления", 
    path: "/consumptions", 
    icon: Wallet,
    showFor: "all"
  }
];
