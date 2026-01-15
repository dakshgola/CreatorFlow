import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MobileSidebar = ({ open, onClose }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "AI Tools", href: "/ai-tools", icon: "✨" },
    { name: "Brand Clients", href: "/clients", icon: "👥" },
    { name: "Tasks", href: "/tasks", icon: "✅" },
    { name: "Content Planner", href: "/planner", icon: "📅" },
    { name: "History", href: "/history", icon: "📜" },
    { name: "Analytics", href: "/analytics", icon: "📈" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
  ];

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[60]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs glass border-r border-slate-800/70 p-4">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold">
              CF
            </div>
            <p className="text-white text-lg font-bold">CreatorFlow</p>
          </Link>

          <button
            onClick={onClose}
            className="btn-ghost px-3 py-2"
          >
            ✖
          </button>
        </div>

        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href === "/dashboard" && location.pathname === "/");

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600/15 border border-indigo-500/20 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 card p-4">
          <p className="text-xs text-slate-400">Built for</p>
          <p className="text-sm font-bold text-white">Indian Creators 🇮🇳</p>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
