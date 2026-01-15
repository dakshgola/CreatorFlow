import React, { useMemo, useState } from "react";
import PageShell from "../components/PageShell";

const Tasks = () => {
  // Demo tasks (replace later with API)
  const [tasks, setTasks] = useState([
    {
      id: "t1",
      title: "Edit cinematic reel for Blinkit campaign",
      status: "Todo",
      priority: "High",
      due: "Today",
    },
    {
      id: "t2",
      title: "Send client update to Nike India",
      status: "Doing",
      priority: "Medium",
      due: "Tomorrow",
    },
    {
      id: "t3",
      title: "Plan content calendar for next week",
      status: "Todo",
      priority: "Low",
      due: "This week",
    },
    {
      id: "t4",
      title: "Finalize captions for travel edit",
      status: "Done",
      priority: "Low",
      due: "Completed",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Modal
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    status: "Todo",
    priority: "Medium",
    due: "This week",
  });

  const statusBadge = (status) => {
    if (status === "Todo") return "badge badge-indigo";
    if (status === "Doing") return "badge badge-violet";
    return "badge badge-green";
  };

  const priorityBadge = (priority) => {
    if (priority === "High") return "badge border-red-500/30 bg-red-500/10 text-red-200";
    if (priority === "Medium") return "badge border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
    return "badge border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ? true : t.status.toLowerCase() === statusFilter;
      const matchPriority =
        priorityFilter === "all"
          ? true
          : t.priority.toLowerCase() === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const grouped = useMemo(() => {
    return {
      Todo: filteredTasks.filter((t) => t.status === "Todo"),
      Doing: filteredTasks.filter((t) => t.status === "Doing"),
      Done: filteredTasks.filter((t) => t.status === "Done"),
    };
  }, [filteredTasks]);

  const handleAddTask = (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) return;

    const payload = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      status: newTask.status,
      priority: newTask.priority,
      due: newTask.due,
    };

    setTasks((p) => [payload, ...p]);
    setOpen(false);

    setNewTask({
      title: "",
      status: "Todo",
      priority: "Medium",
      due: "This week",
    });
  };

  const updateTaskStatus = (id, status) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <PageShell
        title="Tasks"
        subtitle="Manage your daily creator workflow like a real SaaS project board."
        right={
          <>
            <button className="btn-secondary" onClick={() => setTasks([])}>
              🧹 Clear Demo
            </button>
            <button className="btn-primary" onClick={() => setOpen(true)}>
              ➕ Add Task
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-slate-300">Search</label>
            <input
              className="input mt-2"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Status</label>
            <select
              className="input mt-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">all</option>
              <option value="todo">todo</option>
              <option value="doing">doing</option>
              <option value="done">done</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300">Priority</label>
            <select
              className="input mt-2"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">all</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
        </div>
      </div>

      {/* Board */}
      {filteredTasks.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-white font-bold text-lg">No tasks found</p>
          <p className="text-sm text-slate-400 mt-2">
            Add a task or change filters.
          </p>
          <button className="btn-primary mt-6" onClick={() => setOpen(true)}>
            ➕ Create task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {["Todo", "Doing", "Done"].map((col) => (
            <div key={col} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-lg">{col}</p>
                <span className="badge badge-indigo">{grouped[col].length}</span>
              </div>

              <div className="divider my-4" />

              <div className="space-y-3">
                {grouped[col].map((t) => (
                  <div
                    key={t.id}
                    className="rounded-2xl bg-slate-950/40 border border-slate-800 p-4 hover:bg-slate-900/40 transition"
                  >
                    <p className="text-white font-semibold">{t.title}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={statusBadge(t.status)}>{t.status}</span>
                      <span className={priorityBadge(t.priority)}>
                        {t.priority}
                      </span>
                      <span className="badge border-slate-700 bg-slate-800/40 text-slate-200">
                        ⏰ {t.due}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {t.status !== "Todo" && (
                        <button
                          className="btn-secondary"
                          onClick={() => updateTaskStatus(t.id, "Todo")}
                        >
                          ↩ Todo
                        </button>
                      )}

                      {t.status !== "Doing" && (
                        <button
                          className="btn-secondary"
                          onClick={() => updateTaskStatus(t.id, "Doing")}
                        >
                          ▶ Doing
                        </button>
                      )}

                      {t.status !== "Done" && (
                        <button
                          className="btn-primary"
                          onClick={() => updateTaskStatus(t.id, "Done")}
                        >
                          ✅ Done
                        </button>
                      )}

                      <button
                        className="btn-danger"
                        onClick={() => deleteTask(t.id)}
                      >
                        🗑 Delete
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

          <div className="relative w-full max-w-lg card p-6 animate-pop-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Add Task</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Create a new task and track progress.
                </p>
              </div>

              <button className="btn-ghost" onClick={() => setOpen(false)}>
                ✖
              </button>
            </div>

            <div className="divider my-6" />

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Task title</label>
                <input
                  className="input mt-2"
                  placeholder="Example: Edit reel for client"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-300">Status</label>
                  <select
                    className="input mt-2"
                    value={newTask.status}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <option>Todo</option>
                    <option>Doing</option>
                    <option>Done</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Priority</label>
                  <select
                    className="input mt-2"
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, priority: e.target.value }))
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Due</label>
                  <select
                    className="input mt-2"
                    value={newTask.due}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, due: e.target.value }))
                    }
                  >
                    <option>Today</option>
                    <option>Tomorrow</option>
                    <option>This week</option>
                    <option>Next week</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary w-full py-3">
                ✅ Add Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
