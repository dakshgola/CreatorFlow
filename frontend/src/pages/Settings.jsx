import React, { useState } from "react";
import { toast } from "react-hot-toast";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext.jsx";

const Settings = () => {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success("Profile saved (demo)");
  };

  const clearLocal = () => {
    localStorage.clear();
    toast.success("Local data cleared");
    window.location.reload();
  };

  return (
    <div>
      <PageShell
        title="Settings"
        subtitle="Manage your profile and security settings."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Profile */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white">Profile</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Update your account information.
                </p>
              </div>
              <span className="badge badge-indigo">Account</span>
            </div>

            <div className="divider my-6" />

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Full Name</label>
                <input
                  className="input mt-2"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Email</label>
                <input
                  className="input mt-2"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="Your email"
                />
              </div>

              <button className="btn-primary w-full py-3">
                ✅ Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Security */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white">Security</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Control session and access.
                </p>
              </div>
              <span className="badge badge-green">Safe</span>
            </div>

            <div className="divider my-6" />

            <button
              className="btn-danger w-full justify-center py-3"
              onClick={() => {
                logout();
                toast.success("Logged out");
              }}
            >
              🚪 Logout
            </button>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border border-red-500/20">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white">Danger Zone</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Reset local data if UI breaks or cache is corrupted.
                </p>
              </div>
              <span className="badge border-red-500/30 bg-red-500/10 text-red-200">
                Warning
              </span>
            </div>

            <div className="divider my-6" />

            <button
              className="btn-danger w-full justify-center py-3"
              onClick={clearLocal}
            >
              🧨 Clear Local Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
