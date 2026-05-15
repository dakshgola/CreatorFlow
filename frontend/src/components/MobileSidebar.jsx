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
  Zap,
  X
} from "lucide-react";

const MobileSidebar = ({ open, onClose }) => {
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

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[60]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-white border-r border-gray-100 p-4 flex flex-col animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between mb-6 px-2">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-white">
              <Zap size={18} />
            </div>
            <p className="text-gray-900 text-sm font-semibold tracking-tight">CreatorFlow</p>
          </Link>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="space-y-1 flex-1 overflow-y-auto scrollbar-saas">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href === "/dashboard" && location.pathname === "/");

            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
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

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">Creator</p>
               <p className="text-xs text-gray-500 truncate">Pro Plan</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
