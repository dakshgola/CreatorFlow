import React, { useMemo, useState } from "react";
import PageShell from "../components/PageShell";

const STATUSES = ["Idea", "Script", "Shoot", "Edit", "Posted"];

const Planner = () => {
  // Demo Projects (replace later with DB)
  const [projects, setProjects] = useState([
    {
      id: "p1",
      title: "Blinkit Emotional Story Ad",
      status: "Idea",
      script: "Hook: Family time > chores. Blinkit saves time.\nValue: Quick delivery.\nCTA: Try it now.",
      captions: ["Small moments matter ❤️", "Family > everything 🏠"],
    },
    {
      id: "p2",
      title: "Cinematic Gym Motivation Reel",
      status: "Script",
      script: "Hook: You don’t need motivation.\nValue: You need a system.\nCTA: Save this.",
      captions: ["Discipline > motivation 💪"],
    },
    {
      id: "p3",
      title: "Photography BTS Reel",
      status: "Edit",
      script: "Show setup → lighting → shot → final grade.",
      captions: ["Behind the shot 📸"],
    },
  ]);

  const [search, setSearch] = useState("");

  // Modal state
  const [open, setOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    status: "Idea",
    script: "",
    caption: "",
  });

  const filtered = useMemo(() => {
    return projects.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  const grouped = useMemo(() => {
    const obj = {};
    for (const s of STATUSES) obj[s] = [];
    filtered.forEach((p) => obj[p.status]?.push(p));
    return obj;
  }, [filtered]);

  const moveProject = (id, nextStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
    );
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    const payload = {
      id: Date.now().toString(),
      title: newProject.title.trim(),
      status: newProject.status,
      script: newProject.script.trim(),
      captions: newProject.caption.trim() ? [newProject.caption.trim()] : [],
    };

    setProjects((p) => [payload, ...p]);
    setOpen(false);

    setNewProject({
      title: "",
      status: "Idea",
      script: "",
      caption: "",
    });
  };

  return (
    <div>
      <PageShell
        title="Content Planner"
        subtitle="Manage your creator content pipeline like a premium SaaS workflow board."
        right={
          <>
            <button className="btn-secondary" onClick={() => setProjects([])}>
              🧹 Clear Demo
            </button>
            <button className="btn-primary" onClick={() => setOpen(true)}>
              ➕ Add Project
            </button>
          </>
        }
      />

      {/* Search Bar */}
      <div className="card p-5 mb-6">
        <label className="text-sm text-slate-300">Search Projects</label>
        <input
          className="input mt-2"
          placeholder="Search your content ideas, scripts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Pipeline Board */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-white font-bold text-lg">No projects found</p>
          <p className="text-sm text-slate-400 mt-2">
            Add projects or search something else.
          </p>
          <button className="btn-primary mt-6" onClick={() => setOpen(true)}>
            ➕ Add your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {STATUSES.map((col) => (
            <div key={col} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="text-white font-bold">{col}</p>
                <span className="badge badge-indigo">{grouped[col].length}</span>
              </div>

              <div className="divider my-4" />

              <div className="space-y-3">
                {grouped[col].map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-slate-950/40 border border-slate-800 p-4 hover:bg-slate-900/40 transition"
                  >
                    <p className="text-white font-semibold">{p.title}</p>

                    {p.script && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                        {p.script}
                      </p>
                    )}

                    {p.captions?.length > 0 && (
                      <p className="text-xs text-indigo-300 mt-2">
                        Caption: {p.captions[0]}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* Move Back */}
                      {STATUSES.indexOf(col) > 0 && (
                        <button
                          className="btn-secondary"
                          onClick={() =>
                            moveProject(
                              p.id,
                              STATUSES[STATUSES.indexOf(col) - 1]
                            )
                          }
                        >
                          ← Back
                        </button>
                      )}

                      {/* Move Forward */}
                      {STATUSES.indexOf(col) < STATUSES.length - 1 && (
                        <button
                          className="btn-primary"
                          onClick={() =>
                            moveProject(
                              p.id,
                              STATUSES[STATUSES.indexOf(col) + 1]
                            )
                          }
                        >
                          Next →
                        </button>
                      )}

                      <button
                        className="btn-danger"
                        onClick={() => deleteProject(p.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-xl card p-6 animate-pop-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Add Project</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Add a new content idea into your pipeline.
                </p>
              </div>

              <button className="btn-ghost" onClick={() => setOpen(false)}>
                ✖
              </button>
            </div>

            <div className="divider my-6" />

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Title</label>
                <input
                  className="input mt-2"
                  placeholder="Example: Viral gym reel for Instagram"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300">Status</label>
                  <select
                    className="input mt-2"
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300">1 Caption</label>
                  <input
                    className="input mt-2"
                    placeholder="Example: Discipline wins 💪"
                    value={newProject.caption}
                    onChange={(e) =>
                      setNewProject((p) => ({ ...p, caption: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300">Script / Notes</label>
                <textarea
                  className="textarea mt-2"
                  placeholder="Write script or notes..."
                  value={newProject.script}
                  onChange={(e) =>
                    setNewProject((p) => ({ ...p, script: e.target.value }))
                  }
                />
              </div>

              <button className="btn-primary w-full py-3">
                ✅ Add Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
