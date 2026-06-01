import React, { useState } from "react";
import PageShell from "../components/PageShell";
import useApi from "../hooks/useApi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { TrendingUp, TrendingDown, Eye, Users, Clock, Award, Sparkles, RefreshCw, BarChart2 } from "lucide-react";

const Analytics = () => {
  const [range, setRange] = useState("30d"); // 30d is default
  const { data: apiData, loading, error, callApi } = useApi("/api/creator-analytics", {
    method: "GET",
    immediate: true
  });

  const analyticsData = apiData?.data;
  const current = analyticsData?.current;
  const chartData = analyticsData?.chartData || [];

  const handleRefresh = async () => {
    await callApi();
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-12">
        <PageShell
          title="Analytics"
          subtitle="Loading your creator stats..."
        />
        <div className="saas-container py-8 animate-pulse space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white border border-gray-100 rounded-2xl shadow-sm" />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 h-[450px] bg-white border border-gray-100 rounded-2xl shadow-sm" />
            <div className="h-[450px] bg-white border border-gray-100 rounded-2xl shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !current) {
    return (
      <div className="min-h-screen pb-12 flex flex-col items-center justify-center bg-gray-50/50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Analytics</h3>
          <p className="text-sm text-gray-500 mb-6">
            {error || "No active creator profile connected or analytics are still generating."}
          </p>
          <button onClick={handleRefresh} className="btn-primary w-full flex items-center justify-center gap-2">
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Format cards to represent MongoDB metrics
  const cards = [
    {
      label: "Total Views",
      value: current.totalViews.toLocaleString("en-IN"),
      meta: current.viewsDeltaPercent >= 0 
        ? `${current.viewsDeltaPercent.toFixed(1)}% vs yesterday` 
        : `${Math.abs(current.viewsDeltaPercent).toFixed(1)}% vs yesterday`,
      deltaType: current.viewsDeltaPercent >= 0 ? "up" : "down",
      icon: <Eye className="text-indigo-500" size={22} />,
      bg: "bg-indigo-50"
    },
    {
      label: "Total Subscribers",
      value: current.totalSubscribers.toLocaleString("en-IN"),
      meta: current.subscribersDeltaPercent >= 0 
        ? `${current.subscribersDeltaPercent.toFixed(1)}% vs yesterday` 
        : `${Math.abs(current.subscribersDeltaPercent).toFixed(1)}% vs yesterday`,
      deltaType: current.subscribersDeltaPercent >= 0 ? "up" : "down",
      icon: <Users className="text-emerald-500" size={22} />,
      bg: "bg-emerald-50"
    },
    {
      label: "Watch Time",
      value: `${current.watchTimeHours.toFixed(1)}h`,
      meta: "Accrued watch hours",
      deltaType: "neutral",
      icon: <Clock className="text-blue-500" size={22} />,
      bg: "bg-blue-50"
    },
    {
      label: "Top Video",
      value: current.topPerformingVideoViews > 0 ? current.topPerformingVideoTitle : "No data",
      meta: current.topPerformingVideoViews > 0 
        ? `${current.topPerformingVideoViews.toLocaleString("en-IN")} views` 
        : "Connect YouTube account",
      deltaType: "neutral",
      icon: <Award className="text-amber-500" size={22} />,
      bg: "bg-amber-50"
    }
  ];

  return (
    <div className="pb-12">
      <PageShell
        title="Analytics"
        subtitle="Track channel performance metrics and AI generated strategic recommendations."
        right={
          <div className="flex gap-2">
            <button onClick={handleRefresh} className="btn-secondary flex items-center gap-1.5 py-2">
              <RefreshCw size={14} /> Refresh
            </button>
            <select
              className="input py-2 w-[140px]"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="card card-hover p-5 border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{c.label}</span>
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                {c.icon}
              </div>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight truncate max-w-full" title={String(c.value)}>
                {c.value}
              </p>
              
              <div className="flex items-center gap-1 mt-2">
                {c.deltaType === "up" && <TrendingUp size={14} className="text-emerald-500" />}
                {c.deltaType === "down" && <TrendingDown size={14} className="text-rose-500" />}
                <p className={`text-xs font-medium ${
                  c.deltaType === "up" ? "text-emerald-600" : c.deltaType === "down" ? "text-rose-600" : "text-gray-400"
                }`}>
                  {c.meta}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Stats Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Area: Views Trend Chart */}
        <div className="xl:col-span-2 card p-6 border border-gray-100">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Views & Subscriber Growth</h2>
              <p className="text-sm text-gray-500 mt-1">Aggregated statistics from connected platforms.</p>
            </div>
            <span className="badge badge-emerald">Realtime</span>
          </div>

          <div className="divider my-6" />

          <div className="h-[360px] w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">Not enough historical trend data yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                      backgroundColor: '#fff' 
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    name="Views"
                    stroke="#6366f1" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="subscribers" 
                    name="Subscribers"
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorSubs)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Area: AI Insights & Platforms */}
        <div className="flex flex-col gap-6">
          
          {/* AI Insights Card */}
          <div className="card p-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} className="text-white" />
            </div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/25 flex items-center justify-center">
                <Sparkles size={16} className="text-indigo-300" />
              </div>
              <h3 className="font-bold text-white">Daily AI Briefing</h3>
            </div>

            <p className="text-sm text-indigo-100/90 leading-relaxed mb-4 relative z-10">
              {current.dailyInsight || "Syncing your platforms to synthesize customized content tips, timing recommendations, and creative opportunities."}
            </p>

            <div className="text-xs text-indigo-300/80 font-medium relative z-10">
              Generated by Gemini 2.5 Flash
            </div>
          </div>

          {/* Platform breakdown */}
          <div className="card p-6 border border-gray-100 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Platform Share</h3>
              <p className="text-xs text-gray-500 mb-4">View distribution across active networks.</p>
              
              <div className="space-y-4">
                {[
                  { name: "YouTube", value: 65, color: "bg-red-500" },
                  { name: "Instagram Reels", value: 25, color: "bg-pink-500" },
                  { name: "TikTok", value: 10, color: "bg-slate-800" },
                ].map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-700">{p.name}</span>
                      <span className="text-gray-900">{p.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${p.color}`} style={{ width: `${p.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50">
              <button onClick={() => alert("Deep integrations coming soon!")} className="btn-secondary w-full text-xs">
                Integrate TikTok & IG →
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Analytics;
