import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  LayoutDashboard, 
  Sparkles, 
  Users, 
  CheckSquare, 
  CalendarDays, 
  History, 
  BarChart3, 
  Settings,
  Zap
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Tools", href: "/ai-tools", icon: Sparkles },
    { name: "Brand Clients", href: "/clients", icon: Users },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Content Planner", href: "/planner", icon: CalendarDays },
    { name: "History", href: "/history", icon: History },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col z-50 bg-white border-r border-gray-100">
      <div className="h-full flex flex-col">
        {/* Brand */}
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-gray-900">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-gray-900 text-sm font-semibold tracking-tight">
                CreatorFlow
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="px-4 overflow-y-auto scrollbar-saas flex-1">
          <p className="text-xs font-medium text-gray-400 px-3 mb-3 uppercase tracking-wider">
            Workspace
          </p>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href === "/dashboard" && location.pathname === "/");
              
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-gray-50 text-gray-900 font-medium"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-gray-900" : "text-gray-400"} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 mt-auto">
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">Creator</p>
               <p className="text-xs text-gray-500 truncate">Pro Plan</p>
             </div>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
