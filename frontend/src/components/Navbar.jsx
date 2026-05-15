import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import MobileSidebar from "./MobileSidebar";
import { Menu, Settings, LogOut } from "lucide-react";

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

      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="saas-container h-16 flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <h1 className="text-base font-semibold text-gray-900 truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen((p) => !p)}
              className="px-2 py-1.5 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <span className="hidden md:inline text-sm font-medium text-gray-700 max-w-[140px] truncate">
                {user?.name || "User"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="fixed top-16 right-6 w-64 card animate-pop-in z-[99999] bg-white">
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {user?.email || ""}
                  </p>
                </div>

                <div className="p-2 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/settings");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} className="text-gray-400" /> Settings
                  </button>

                  <button
                     onClick={handleLogout}
                     className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="text-red-400" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
