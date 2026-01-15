import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useApi from '../hooks/useApi';
import React from "react";


const Analytics = () => {
  const analyticsApi = useApi('/analytics', { immediate: true });

  useEffect(() => {
    if (analyticsApi.error) {
      toast.error('Failed to load analytics');
    }
  }, [analyticsApi.error]);

  const StatCard = ({ title, value, color, icon }) => (
    <div className={`bg-slate-900/60 border-l-4 ${color} border border-slate-800 p-6 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-400 text-sm font-semibold mb-2">{title}</h3>
          <p className="text-3xl font-bold text-white">
            {analyticsApi.loading ? '...' : value}
          </p>
        </div>
        {icon && (
          <div className="text-4xl opacity-20">
            {icon}
          </div>
        )}
      </div>
    </div>
  );

  const stats = analyticsApi.data || {
    clientsCount: 0,
    tasksDueThisMonth: 0,
    paymentsPending: 0,
    projectsCount: 0
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto bg-slate-950 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Analytics</h1>
        <p className="text-slate-400 text-sm">Your creator journey at a glance</p>
      </div>

      {analyticsApi.loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-800 border-t-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Brand Clients"
            value={stats.clientsCount}
            color="border-indigo-500"
            icon="👥"
          />
          <StatCard
            title="Projects"
            value={stats.projectsCount}
            color="border-violet-500"
            icon="📁"
          />
          <StatCard
            title="Tasks Due This Month"
            value={stats.tasksDueThisMonth}
            color="border-yellow-500"
            icon="📅"
          />
          <StatCard
            title="Pending Payments"
            value={`₹${stats.paymentsPending}`}
            color="border-green-500"
            icon="💰"
          />
        </div>
      )}
    </div>
  );
};

export default Analytics;