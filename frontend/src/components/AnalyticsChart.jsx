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
  // Demo data (later replace from API)
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
    <div className="h-[320px] w-full rounded-2xl bg-slate-950/40 border border-slate-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis dataKey="name" stroke="rgba(148,163,184,0.7)" />
          <YAxis stroke="rgba(148,163,184,0.7)" />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: "12px",
              color: "#fff",
            }}
            labelStyle={{ color: "#fff" }}
          />

          {/* Views */}
          <Line
            type="monotone"
            dataKey="views"
            stroke="#6366f1"
            strokeWidth={3}
            dot={false}
          />

          {/* Engagement */}
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="#a855f7"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
