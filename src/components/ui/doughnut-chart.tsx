
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DoughnutChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

export function DoughnutChart({
  data,
  innerRadius = 60,
  outerRadius = 80,
  className,
}: DoughnutChartProps) {
  // Generate default colors if not provided
  const defaultColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className={className} style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            paddingAngle={1}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || defaultColors[index % defaultColors.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}`, 'Value']}
            labelFormatter={(name) => `${name}`}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom"
            align="center"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
