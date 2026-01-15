import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import MobileSidebar from "./MobileSidebar";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path === "/ai-tools") return "AI Tools";
    if (path === "/clients") return "Brand Clients";
    if (path === "/tasks") return "Tasks";
    if (path === "/planner") return "Content Planner";
    if (path === "/payments") return "Payments";
    if (path === "/history") return "History";
    if (path === "/analytics") return "Analytics";
    if (path === "/settings") return "Settings";
    return "CreatorFlow";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <header className="sticky top-0 z-50">
        <div className="glass border-b border-slate-800/70">
          <div className="saas-container h-16 flex items-center justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="lg:hidden btn-secondary px-3 py-2 rounded-xl"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                ☰
              </button>

              <h1 className="text-lg font-bold text-white truncate">
                {getPageTitle()}
              </h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                className="btn-secondary px-3 py-2 rounded-xl flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <span className="hidden md:inline text-sm font-semibold text-white max-w-[140px] truncate">
                  {user?.name || "User"}
                </span>
              </button>

              {/* Dropdown Menu (FIXED) */}
              {userMenuOpen && (
                <div className="fixed top-16 right-6 w-72 card animate-pop-in z-[99999]">
                  <div className="p-4 border-b border-slate-800/70">
                    <p className="text-sm font-bold text-white truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {user?.email || ""}
                    </p>
                  </div>

                  <div className="p-3 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full btn-secondary justify-start"
                    >
                      ⚙️ Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full btn-danger justify-start"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
