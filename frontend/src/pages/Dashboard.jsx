import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AnalyticsChart from "../components/AnalyticsChart";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen">
      <div className="saas-container py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Welcome, {userName} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              {greeting}! Here’s your CreatorFlow overview for today.
            </p>
          </div>

          <div className="flex gap-2 relative z-0">
            <button className="btn-secondary" onClick={() => navigate("/tasks")}>
              📌 Quick Add
            </button>

            <button className="btn-primary" onClick={() => navigate("/planner")}>
              ✨ New Project
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card card-hover p-6">
            <p className="text-sm text-slate-400">Brand Clients</p>
            <p className="text-3xl font-extrabold text-white mt-2">
              {summaryData.totalClients}
            </p>
            <p className="text-xs text-slate-500 mt-2">+2 this month</p>
          </div>

          <div className="card card-hover p-6">
            <p className="text-sm text-slate-400">Pending Tasks</p>
            <p className="text-3xl font-extrabold text-white mt-2">
              {summaryData.pendingTasks}
            </p>
            <p className="text-xs text-slate-500 mt-2">3 due today</p>
          </div>

          <div className="card card-hover p-6">
            <p className="text-sm text-slate-400">Payments Due</p>
            <p className="text-3xl font-extrabold text-white mt-2">
              ₹{summaryData.paymentsDue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-500 mt-2">next 7 days</p>
          </div>

          <div className="card card-hover p-6">
            <p className="text-sm text-slate-400">Engagement</p>
            <p className="text-3xl font-extrabold text-white mt-2">
              +{summaryData.engagement}%
            </p>
            <p className="text-xs text-slate-500 mt-2">weekly growth</p>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Content Performance
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Weekly engagement overview
                </p>
              </div>

              <button
                className="btn-secondary"
                onClick={() => navigate("/analytics")}
              >
                Analytics →
              </button>
            </div>

            <div className="divider my-6" />

            {/* ✅ Real Chart */}
            <AnalyticsChart />
          </div>

          {/* Activity */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Updates from your work
                </p>
              </div>

              <button
                className="btn-secondary"
                onClick={() => navigate("/history")}
              >
                View all →
              </button>
            </div>

            <div className="divider my-6" />

            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-slate-950/40 border border-slate-800 p-4 hover:bg-slate-900/40 transition"
                >
                  <p className="text-white font-semibold">
                    ✅ Client approved a draft
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    New content approved for campaign.
                  </p>
                  <p className="text-xs text-slate-500 mt-2">2h ago</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
