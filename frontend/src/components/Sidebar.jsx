import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Sidebar = () => {
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

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col z-50">
      <div className="h-full glass border-r border-slate-800/80">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/70">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/20">
              CF
            </div>
            <div>
              <p className="text-white text-lg font-bold leading-5">
                CreatorFlow
              </p>
              <p className="text-xs text-slate-400 mt-1">
                SaaS for creators
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="p-4 overflow-y-auto scrollbar-saas flex-1">
          <p className="text-xs font-semibold text-slate-500 px-3 mb-2">
            Workspace
          </p>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href === "/dashboard" && location.pathname === "/");

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-600/15 border border-indigo-500/20 text-white shadow-sm shadow-indigo-500/10"
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
        </nav>

        {/* Footer */}
       <div className="p-4 border-t border-slate-800">
  <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-3 text-center">
    <p className="text-xs text-slate-400">Built for</p>
    <p className="text-sm font-semibold text-white">Indian Creators 🇮🇳</p>
  </div>
</div>

      </div>
    </aside>
  );
};

export default Sidebar;
