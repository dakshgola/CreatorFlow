import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import useApi from "../hooks/useApi";
import AnalyticsChart from "../components/AnalyticsChart";
import { 
  Plus, 
  Sparkles, 
  X, 
  Bot,
  Copy,
  RefreshCw,
  Users,
  CheckCircle2,
  Banknote,
  TrendingUp,
  ChevronRight,
  CheckCircle
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isDigestModalOpen, setIsDigestModalOpen] = useState(false);
  const digestApi = useApi("/api/ai/digest", { method: "GET", immediate: false });

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

  const greeting = getTimeBasedGreeting();
  const userName = user?.name || "Creator";

  const summaryData = {
    totalClients: 12,
    pendingTasks: 8,
    paymentsDue: 2450,
    engagement: 24.5,
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="saas-container py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {greeting}, {userName}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Here’s your CreatorFlow overview for today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-secondary text-sm" onClick={handleGenerateDigest}>
              <Bot size={16} /> AI Digest
            </button>
            <button className="btn-secondary text-sm" onClick={() => navigate("/tasks")}>
              <Plus size={16} /> Quick Add
            </button>
            <button className="btn-primary text-sm" onClick={() => navigate("/planner")}>
              <Sparkles size={16} /> New Project
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Brand Clients</p>
              <Users size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {summaryData.totalClients}
              </p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">+2 this month</p>
            </div>
          </div>

          <div className="card card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
              <CheckCircle2 size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {summaryData.pendingTasks}
              </p>
              <p className="text-xs text-amber-600 mt-1 font-medium">3 due today</p>
            </div>
          </div>

          <div className="card card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Payments Due</p>
              <Banknote size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{summaryData.paymentsDue.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">next 7 days</p>
            </div>
          </div>

          <div className="card card-hover p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Engagement</p>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                +{summaryData.engagement}%
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">weekly growth</p>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Content Performance
                </h2>
              </div>
              <button
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium transition-colors"
                onClick={() => navigate("/analytics")}
              >
                Analytics <ChevronRight size={14} />
              </button>
            </div>

            {/* Real Chart */}
            <AnalyticsChart />
          </div>

          {/* Activity */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <button
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium transition-colors"
                onClick={() => navigate("/history")}
              >
                View all <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex gap-4 items-start"
                >
                  <div className="mt-0.5">
                    <CheckCircle size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Client approved a draft
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      New content approved for campaign.
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">2h</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Digest Modal */}
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
