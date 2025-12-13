import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  // Time-based greeting with Indian touch
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Namaste, Good morning';
    if (hour >= 12 && hour < 17) return 'Namaste, Good afternoon';
    if (hour >= 17 && hour < 22) return 'Namaste, Good evening';
    return 'Namaste, Working late';
  };

  const greeting = getTimeBasedGreeting();
  const userName = user?.name || 'Creator';
  const emoji = new Date().getHours() >= 22 || new Date().getHours() < 5 ? '🌙' : '👋';

  // Dummy data for summary cards
  const summaryData = {
    totalClients: 12,
    pendingTasks: 8,
    paymentsDue: 2450,
    engagement: 24.5,
  };

  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            {greeting}, {userName} {emoji}. Here's what's happening today.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Clients Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Brand Clients</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {summaryData.totalClients}
                </p>
                <p className="text-xs text-slate-400 mt-1">+2 from last month</p>
              </div>
              <div className="bg-indigo-500/20 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Tasks Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Pending Tasks</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {summaryData.pendingTasks}
                </p>
                <p className="text-xs text-slate-400 mt-1">3 due today</p>
              </div>
              <div className="bg-yellow-500/20 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Payments Due Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Pending Payments</p>
                <p className="text-3xl font-bold text-white mt-2">
                  ₹{summaryData.paymentsDue.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-400 mt-1">Due within 7 days</p>
              </div>
              <div className="bg-green-500/20 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Engagement Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Engagement</p>
                <p className="text-3xl font-bold text-white mt-2">
                  +{summaryData.engagement}%
                </p>
                <p className="text-xs text-slate-400 mt-1">Across all channels</p>
              </div>
              <div className="bg-violet-500/20 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Performance Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-1">Content Performance</h2>
              <p className="text-sm text-slate-400">Weekly engagement overview</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl h-64 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Bar Chart Placeholder</p>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-1">Recent Activity</h2>
              <p className="text-sm text-slate-400">Latest updates from your brand clients</p>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-all duration-200">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Client Update</p>
                    <p className="text-xs text-slate-400 mt-0.5">New content approved for campaign.</p>
                  </div>
                  <p className="text-xs text-slate-500 flex-shrink-0">2h ago</p>
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
