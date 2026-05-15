import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AnalyticsChart = () => {
  const data = [
    { name: "Mon", views: 1200, engagement: 14 },
    { name: "Tue", views: 1900, engagement: 16 },
    { name: "Wed", views: 1500, engagement: 15 },
    { name: "Thu", views: 2600, engagement: 18 },
    { name: "Fri", views: 3400, engagement: 21 },
    { name: "Sat", views: 4100, engagement: 23 },
    { name: "Sun", views: 3800, engagement: 20 },
  ];

  return (
    <div className="h-[280px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #f3f4f6",
              borderRadius: "8px",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              color: "#111827",
              fontSize: "12px",
              fontWeight: 500
            }}
            itemStyle={{ color: "#111827" }}
            labelStyle={{ color: "#6b7280", marginBottom: "4px" }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#111827"
            strokeWidth={2}
            dot={{ r: 3, fill: "#111827", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#111827", strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="#9ca3af"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
