import React, { useMemo, useState } from "react";
import PageShell from "../components/PageShell";

const History = () => {
  const [logs, setLogs] = useState([
    {
      id: "h1",
      type: "AI",
      title: "Generated 5 ideas for fitness niche",
      description: "Prompt: reels for Indian college fitness creators",
      time: "2h ago",
    },
    {
      id: "h2",
      type: "Projects",
      title: "Saved output to Planner",
      description: "Project added: Blinkit Emotional Story Ad",
      time: "5h ago",
    },
    {
      id: "h3",
      type: "Auth",
      title: "Logged in successfully",
      description: "Session started",
      time: "Yesterday",
    },
    {
      id: "h4",
      type: "Other",
      title: "Updated profile settings",
      description: "Theme preferences saved",
      time: "2 days ago",
    },
  ]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase());

      const matchType =
        typeFilter === "all" ? true : l.type.toLowerCase() === typeFilter;

      return matchSearch && matchType;
    });
  }, [logs, search, typeFilter]);

  const typeBadge = (type) => {
    if (type === "AI") return "badge badge-violet";
    if (type === "Projects") return "badge badge-indigo";
    if (type === "Auth") return "badge badge-green";
    return "badge border-slate-700 bg-slate-800/40 text-slate-200";
  };

  const typeDot = (type) => {
    if (type === "AI") return "bg-violet-500";
    if (type === "Projects") return "bg-indigo-500";
    if (type === "Auth") return "bg-emerald-500";
    return "bg-slate-500";
  };

  return (
    <div>
      <PageShell
        title="History"
        subtitle="Track your latest actions across AI tools, planner, clients and settings."
        right={
          <>
            <button className="btn-secondary" onClick={() => setLogs([])}>
              🧹 Clear Demo
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-slate-300">Search</label>
            <input
              className="input mt-2"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Type</label>
            <select
              className="input mt-2"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">all</option>
              <option value="ai">ai</option>
              <option value="projects">projects</option>
              <option value="auth">auth</option>
              <option value="other">other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-white font-bold text-lg">Activity Log</p>
            <p className="text-sm text-slate-400 mt-1">
              Showing {filtered.length} of {logs.length}
            </p>
          </div>
          <span className="badge badge-indigo">Timeline</span>
        </div>

        <div className="divider my-6" />

        {filtered.length === 0 ? (
          <div className="text-center p-10">
            <p className="text-white font-bold text-lg">No activity found</p>
            <p className="text-sm text-slate-400 mt-2">
              Try changing filters or search text.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Line */}
            <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-slate-800/70" />

            <div className="space-y-5">
              {filtered.map((log) => (
                <div key={log.id} className="flex gap-4">
                  {/* Dot */}
                  <div className="relative z-10 mt-1">
                    <div
                      className={`w-3 h-3 rounded-full ${typeDot(log.type)}`}
                    />
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-2xl bg-slate-950/40 border border-slate-800 p-4 hover:bg-slate-900/40 transition">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-white font-semibold">{log.title}</p>
                        <p className="text-sm text-slate-400 mt-1">
                          {log.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={typeBadge(log.type)}>{log.type}</span>
                        <span className="text-xs text-slate-500">{log.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
