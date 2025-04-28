
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketIcon, FileText, BarChart3, Settings, Plane, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SplashScreen } from "@/components/splash-screen";
import { useTickets } from "@/hooks/use-tickets";
import { useAuth } from "@/contexts/AuthContext";
import { hover } from "framer-motion";

const features = [
  {
    title: "Продажа нового билета",
    description: "Создайте новую продажу билета для клиента",
    icon: <TicketIcon className="h-6 w-6" />,
    href: "/sell-ticket",
    color: "from-blue-500 to-sky-400"
  },
  {
    title: "Просмотр проданных билетов",
    description: "Просмотр и управление всеми продажами билетов",
    icon: <FileText className="h-6 w-6" />,
    href: "/sold-tickets",
    color: "from-green-500 to-emerald-400"
  },
  // {
  //   title: "Отчет агента",
  //   description: "Просмотр статистики и эффективности продаж",
  //   icon: <BarChart3 className="h-6 w-6" />,
  //   href: "/admin",
  //   color: "from-purple-500 to-violet-400"
  // },
  {
    title: "Информация об авиалиниях",
    description: "Просмотр информации и деталей авиалиний",
    icon: <Plane className="h-6 w-6" />,
    href: "#",
    color: "from-orange-500 to-amber-400"
  },
  {
    title: "Мой профиль",
    description: "Просмотр и обновление профиля агента",
    icon: <User className="h-6 w-6" />,
    href: "#", 
    color: "from-red-500 to-pink-400"
  },
  {
    title: "Настройки",
    description: "Настройка параметров и предпочтений приложения",
    icon: <Settings className="h-6 w-6" />,
    href: "/settings",
    color: "from-gray-500 to-slate-400"
  }
];

export default function Home() {
  const [animatedItems, setAnimatedItems] = useState<number[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const { data: tickets = [], isLoading } = useTickets();
  const { user } = useAuth();
  
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    features.forEach((_, index) => {
      timeout = setTimeout(() => {
        setAnimatedItems(prev => [...prev, index]);
      }, 100 * index);
    });
    
    const splashTimeout = setTimeout(() => {
      setIsFirstLoad(false);
    }, 3000);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(splashTimeout);
    };
  }, []);
  
  // Calculate some basic stats
  const totalTickets = tickets.length;
  const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
  const avgTicketPrice = totalRevenue / (totalTickets || 1); // Avoid division by zero
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Count tickets with today's date
  const todayTickets = tickets.filter(ticket => ticket.issueDate === today).length;
  
  return (
    <>
      {isFirstLoad && <SplashScreen />}
      
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Добро пожаловать в SkyTrack Pro</h1>
          <p className="text-muted-foreground">
            Управляйте авиабилетами и отслеживайте показатели продаж с легкостью
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="animate-fade-in rounded-[50px] hover:scale-105 bg-indigo-500 text-white animation-delay-100 transition-transform duration-300">
            <CardHeader className="pb-2 text-white">
              <CardTitle className="text-sm font-medium text-white">Всего билетов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalTickets}</div>
              <p className="text-xs text-white text-muted-foreground mt-1">
                {todayTickets} новых сегодня
              </p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in rounded-[50px] bg-yellow-500 text-black animation-delay-100 transition-transform duration-300 hover:scale-105">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                  UZS{totalRevenue.toLocaleString('en-US')}
                  </div>
                  <p className="text-xs text-black text-muted-foreground mt-1">
                  UZS{avgTicketPrice.toFixed(2)} средняя цена
                  </p>
                </CardContent>
                </Card>
          <Card className="animate-fade-in  animation-delay-200 rounded-[50px] bg-green-500 text-white transition-transform duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Продажи сегодня</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayTickets}</div>
              <p className="text-xs text-muted-foreground text-white mt-1">
                {todayTickets > 0 ? "Проданных билетов сегодня" : "Сегодня билетов не продано"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-xl font-semibold mt-6">Быстрые действия</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Link 
              key={feature.title} 
              to={feature.href}
              className={cn(
                "transition-all duration-300 transform",
                hover && "hover:scale-105",
                
                animatedItems.includes(index) ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
            >
              <Card className="h-full hover:shadow-md bg-indigo-200 transition-shadow border-t-4 rounded-[50px] over:-translate-y-1 duration-300" 
                style={{ borderTopColor: `rgb(${feature.color.includes('blue') ? '14, 165, 233' : 
                  feature.color.includes('green') ? '34, 197, 94' : 
                  feature.color.includes('purple') ? '168, 85, 247' : 
                  feature.color.includes('orange') ? '249, 115, 22' :
                  feature.color.includes('red') ? '239, 68, 68' : '107, 114, 128'})` }}>
                <CardHeader>
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-white mb-2 text-indigo-500 shadow-md"
                    style={{ backgroundImage: `linear-gradient(to bottom right, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})` }}>
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
