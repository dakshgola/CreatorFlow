import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill email and password");
      return;
    }

    setLoading(true);
    const res = await login(form);
    setLoading(false);

    if (res?.success) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(res?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-md card p-6 md:p-8 animate-pop-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-indigo-500/20">
            CF
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-4">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Login to manage your creator workflow like a SaaS pro.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              className="input mt-2"
              name="email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              className="input mt-2"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            disabled={loading}
            className={`w-full btn-primary py-3 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="divider my-6" />

        <p className="text-sm text-slate-400 text-center">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-300 hover:text-white font-semibold"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
