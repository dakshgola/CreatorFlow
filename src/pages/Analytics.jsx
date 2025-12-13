import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useApi from '../hooks/useApi';

const Analytics = () => {
  const analyticsApi = useApi('/analytics', { immediate: true });

  useEffect(() => {
    if (analyticsApi.error) {
      toast.error('Failed to load analytics');
    }
  }, [analyticsApi.error]);

  const StatCard = ({ title, value, color, icon }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 ${color} border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
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
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Analytics</h1>

      {analyticsApi.loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Clients"
            value={stats.clientsCount}
            color="border-blue-500"
            icon="👥"
          />
          <StatCard
            title="Projects"
            value={stats.projectsCount}
            color="border-purple-500"
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
            value={stats.paymentsPending}
            color="border-red-500"
            icon="💰"
          />
        </div>
      )}
    </div>
  );
};

export default Analytics;
