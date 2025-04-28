
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  trend?: number;
  iconColor?: string;
  className?: string;
  isValueString?: boolean;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend = 0,
  iconColor = "#0E76FD",
  className,
  isValueString = false,
}: MetricCardProps) {
  // Display trend indicator if a trend is provided
  const showTrend = trend !== 0;
  const trendIsPositive = trend > 0;
  const trendText = `${trendIsPositive ? '+' : ''}${trend}%`;
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">
              {typeof value === 'number' && !isValueString ? value : value}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {showTrend && (
              <p
                className={cn(
                  "text-xs font-medium mt-1",
                  trendIsPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trendText} за период
              </p>
            )}
          </div>
          {Icon && (
            <div 
              className="rounded-full p-2" 
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <Icon 
                className="h-5 w-5" 
                style={{ color: iconColor }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
