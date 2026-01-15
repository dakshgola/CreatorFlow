import React, { useMemo, useState } from "react";
import PageShell from "../components/PageShell";

const Analytics = () => {
  const [range, setRange] = useState("7d");

  const stats = useMemo(() => {
    // Demo values (change later with API)
    if (range === "7d") {
      return {
        views: 245000,
        engagement: 18.4,
        followers: 620,
        revenue: 12500,
      };
    }
    if (range === "30d") {
      return {
        views: 980000,
        engagement: 21.1,
        followers: 2450,
        revenue: 46800,
      };
    }
    return {
      views: 2430000,
      engagement: 24.2,
      followers: 8900,
      revenue: 122500,
    };
  }, [range]);

  const cards = [
    {
      label: "Total Views",
      value: stats.views.toLocaleString("en-IN"),
      meta: "Across all platforms",
      icon: "👀",
    },
    {
      label: "Engagement Rate",
      value: `${stats.engagement}%`,
      meta: "Avg engagement",
      icon: "🔥",
    },
    {
      label: "Followers Gained",
      value: stats.followers.toLocaleString("en-IN"),
      meta: "Net growth",
      icon: "📈",
    },
    {
      label: "Revenue",
      value: `₹${stats.revenue.toLocaleString("en-IN")}`,
      meta: "Estimated earnings",
      icon: "💰",
    },
  ];

  return (
    <div>
      <PageShell
        title="Analytics"
        subtitle="Track content performance and growth like a premium SaaS dashboard."
        right={
          <>
            <select
              className="input py-2 w-[140px]"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card card-hover p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{c.label}</p>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {c.value}
                </p>
                <p className="text-xs text-slate-500 mt-2">{c.meta}</p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-xl">
                {c.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-white">
                Views Trend ({range})
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Placeholder chart — connect API + Recharts later.
              </p>
            </div>

            <span className="badge badge-indigo">Chart</span>
          </div>

          <div className="divider my-6" />

          <div className="h-[320px] rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-center">
            <p className="text-slate-500 text-sm">📊 Views Chart Placeholder</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-white">
                Platform Breakdown
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Where your reach comes from.
              </p>
            </div>

            <span className="badge badge-violet">Insights</span>
          </div>

          <div className="divider my-6" />

          <div className="space-y-3">
            {[
              { name: "Instagram", value: 62 },
              { name: "YouTube", value: 28 },
              { name: "Shorts", value: 10 },
            ].map((p) => (
              <div
                key={p.name}
                className="rounded-2xl bg-slate-950/40 border border-slate-800 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">{p.name}</p>
                  <p className="text-sm text-slate-300">{p.value}%</p>
                </div>

                <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500/70"
                    style={{ width: `${p.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button className="btn-secondary w-full mt-5">
            View detailed report →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
