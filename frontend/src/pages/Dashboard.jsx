import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import useApi from "../hooks/useApi";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Plus, 
  Sparkles, 
  X, 
  Bot,
  Copy,
  RefreshCw,
  FileText,
  Calendar,
  Bookmark,
  Target,
  TrendingUp
} from "lucide-react";

// Fallback logic for local vs prod API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Stats State
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Digest State (kept from original)
  const [isDigestModalOpen, setIsDigestModalOpen] = useState(false);
  const digestApi = useApi("/api/ai/digest", { method: "GET", immediate: false });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Use credentials to automatically pass the httpOnly cookie
      const res = await fetch(`${API_URL}/analytics/summary`, { credentials: "include" });
      const json = await res.json();
      
      if (json.success || json.data) {
        setStats(json.data || json);
      } else {
        throw new Error("Failed to load analytics");
      }
    } catch (err) {
      setError("Unable to load dashboard data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDigest = async () => {
    setIsDigestModalOpen(true);
    await digestApi.callApi();
  };

  const copyDigest = async () => {
    if (digestApi.data?.data) {
      try {
        await navigator.clipboard.writeText(digestApi.data.data);
        toast.success("Copied to clipboard");
      } catch (err) {
        toast.error("Failed to copy");
      }
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Working late";
  };

  const formatXAxisDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-12">
        <div className="saas-container py-8 animate-pulse">
           <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
           <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white border border-gray-100 rounded-xl shadow-sm"></div>)}
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="h-80 bg-white border border-gray-100 rounded-xl shadow-sm"></div>
             <div className="h-80 bg-white border border-gray-100 rounded-xl shadow-sm"></div>
           </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <Target className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Oops, something went wrong</h3>
          <p className="text-red-500 font-medium">{error}</p>
          <button onClick={fetchStats} className="mt-4 btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  const pieData = stats ? [
    { name: 'Ideas', value: stats.byType?.idea || 0, color: '#8b5cf6' }, // purple-500
    { name: 'Captions', value: stats.byType?.caption || 0, color: '#3b82f6' }, // blue-500
    { name: 'Scores', value: stats.byType?.score || 0, color: '#22c55e' } // green-500
  ] : [];

  return (
    <div className="min-h-screen pb-12">
      <div className="saas-container py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {getTimeBasedGreeting()}, {user?.name || "Creator"}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Here’s your CreatorFlow analytics overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-secondary text-sm" onClick={handleGenerateDigest}>
              <Bot size={16} /> AI Digest
            </button>
            <button className="btn-secondary text-sm" onClick={() => navigate("/history")}>
              <Bookmark size={16} /> Saved Items
            </button>
            <button className="btn-primary text-sm" onClick={() => navigate("/planner")}>
              <Sparkles size={16} /> Content Planner
            </button>
          </div>
        </div>

        {/* Real Data Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Total Generations</p>
              <FileText size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-gray-900">
                {stats.totalGenerations}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">all-time AI interactions</p>
            </div>
          </div>

          <div className="card card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Generated This Week</p>
              <Calendar size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-gray-900">
                {stats.thisWeek}
              </p>
              <p className="text-xs text-emerald-600 mt-1.5 font-medium flex items-center gap-1">
                <TrendingUp size={12} /> Active streak
              </p>
            </div>
          </div>

          <div className="card card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Saved Items</p>
              <Bookmark size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-gray-900">
                {stats.savedItems}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">bookmarked for later</p>
            </div>
          </div>

          <div className="card card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Avg Content Score</p>
              <Target size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-gray-900">
                {stats.averageScore > 0 ? stats.averageScore : '-'}<span className="text-lg text-gray-400">/10</span>
              </p>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">across all rated content</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activity Line Chart */}
          <div className="card p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">14-Day Activity Trend</h2>
                <p className="text-xs text-gray-500 mt-1">Generations over the last two weeks</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyActivity} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatXAxisDate} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                    dy={10} 
                  />
                  <YAxis 
                    allowDecimals={false}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                  />
                  <RechartsTooltip 
                    labelFormatter={(label) => formatXAxisDate(label)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Generations"
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{r: 4, strokeWidth: 2, fill: '#fff', stroke: '#6366f1'}} 
                    activeDot={{r: 6, stroke: '#6366f1', strokeWidth: 2}} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Content Breakdown Pie Chart */}
          <div className="card p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Content Breakdown</h2>
                <p className="text-xs text-gray-500 mt-1">Distribution of AI usage by type</p>
              </div>
            </div>
            <div className="h-64 w-full flex flex-col justify-center">
              {stats.totalGenerations === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  No data to display yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1f2937', fontWeight: 500 }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Digest Modal (Unchanged functionality) */}
      {isDigestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-2xl relative animate-pop-in">
            <button
              onClick={() => setIsDigestModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">AI Weekly Digest</h3>
                <p className="text-xs text-gray-500 font-medium">Personalized insights from your last 7 days</p>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full my-4" />

            <div className="min-h-[120px] flex items-center justify-center py-2">
              {digestApi.loading ? (
                <div className="space-y-3 w-full">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-full mt-4"></div>
                </div>
              ) : digestApi.error ? (
                <p className="text-red-500 text-sm">{digestApi.error}</p>
              ) : digestApi.data?.data ? (
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {digestApi.data.data}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">No digest available.</p>
              )}
            </div>

            <div className="flex gap-2 mt-6 justify-end">
              <button
                className="btn-secondary py-1.5 text-sm"
                onClick={copyDigest}
                disabled={digestApi.loading || !digestApi.data?.data}
              >
                <Copy size={14} /> Copy
              </button>
              <button
                className="btn-primary py-1.5 text-sm"
                onClick={() => digestApi.callApi()}
                disabled={digestApi.loading}
              >
                <RefreshCw size={14} className={digestApi.loading ? "animate-spin" : ""} /> Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
