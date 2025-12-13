import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'AI Tools', href: '/ai-tools', icon: '✨' },
    { name: 'Brand Clients', href: '/clients', icon: '👥' },
    { name: 'Tasks', href: '/tasks', icon: '✅' },
    { name: 'Content Planner', href: '/planner', icon: '📅' },
    { name: 'History', href: '/history', icon: '📜' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-800 flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
            CF
          </div>
          <span className="text-xl font-bold text-white">CreatorFlow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/dashboard' && location.pathname === '/');
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 text-white border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/40 hover:scale-[1.02]'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Badge */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-slate-400">Built for</p>
          <p className="text-sm font-semibold text-white">Indian Creators 🇮🇳</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
