import React, { useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import useApi from "../hooks/useApi";
import { toast } from "react-hot-toast";
import { Trash2, Plus, CheckCircle2, Circle, Clock, ClipboardList } from "lucide-react";

const Tasks = () => {
  const { data: listData, loading, error, callApi: refetchTasks } = useApi("/api/tasks", {
    method: "GET",
    immediate: true
  });

  const createApi = useApi("/api/tasks", { method: "POST", immediate: false });
  const updateApi = useApi("/api/tasks", { method: "PUT", immediate: false });
  const deleteApi = useApi("/api/tasks", { method: "DELETE", immediate: false });

  const tasks = useMemo(() => {
    return listData?.data || [];
  }, [listData]);

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

  // Helpers to map database structure back to UI expectation
  const getStatusText = (task) => {
    if (task.completed) return "Done";
    if (task.description?.startsWith("Status: ")) {
      return task.description.replace("Status: ", "");
    }
    return "Todo";
  };

  const getFriendlyDueText = (dateString) => {
    if (!dateString) return "This week";
    const date = new Date(dateString);
    const diffTime = date.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 4) return "This week";
    return "Next week";
  };

  const statusBadge = (status) => {
    if (status === "Todo") return "badge badge-indigo";
    if (status === "Doing") return "badge badge-violet";
    return "badge badge-green";
  };

  const priorityBadge = (priority) => {
    const p = String(priority).toLowerCase();
    if (p === "high") return "badge border-red-500/30 bg-red-500/10 text-red-600";
    if (p === "medium") return "badge border-yellow-500/30 bg-yellow-500/10 text-yellow-600";
    return "badge border-emerald-500/30 bg-emerald-500/10 text-emerald-600";
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const status = getStatusText(t);
      const matchStatus =
        statusFilter === "all" ? true : status.toLowerCase() === statusFilter.toLowerCase();
      const matchPriority =
        priorityFilter === "all"
          ? true
          : t.priority.toLowerCase() === priorityFilter.toLowerCase();

      return matchSearch && matchStatus && matchPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const grouped = useMemo(() => {
    return {
      Todo: filteredTasks.filter((t) => getStatusText(t) === "Todo"),
      Doing: filteredTasks.filter((t) => getStatusText(t) === "Doing"),
      Done: filteredTasks.filter((t) => getStatusText(t) === "Done"),
    };
  }, [filteredTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      toast.error("Please fill in task title.");
      return;
    }

    let dueDate = new Date();
    if (newTask.due === "Tomorrow") dueDate = new Date(Date.now() + 86400000);
    else if (newTask.due === "This week") dueDate = new Date(Date.now() + 86400000 * 4);
    else if (newTask.due === "Next week") dueDate = new Date(Date.now() + 86400000 * 7);

    const body = {
      title: newTask.title.trim(),
      dueDate,
      priority: newTask.priority.toLowerCase(),
      completed: newTask.status === "Done",
      description: `Status: ${newTask.status}`
    };

    const res = await createApi.callApi({ body });
    if (res.success) {
      toast.success("Task created!");
      setOpen(false);
      refetchTasks();
      setNewTask({
        title: "",
        status: "Todo",
        priority: "Medium",
        due: "This week",
      });
    } else {
      toast.error(res.error || "Failed to create task");
    }
  };

  const updateTaskStatus = async (id, status) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;

    const body = {
      completed: status === "Done",
      description: `Status: ${status}`
    };

    const res = await updateApi.callApi({
      endpoint: `/api/tasks/${id}`,
      method: "PUT",
      body
    });

    if (res.success) {
      toast.success(`Task moved to ${status}`);
      refetchTasks();
    } else {
      toast.error(res.error || "Failed to move task");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    const res = await deleteApi.callApi({
      endpoint: `/api/tasks/${id}`,
      method: "DELETE"
    });
    if (res.success) {
      toast.success("Task removed");
      refetchTasks();
    } else {
      toast.error(res.error || "Failed to delete task");
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen pb-12">
        <PageShell title="Tasks" subtitle="Loading task board..." />
        <div className="saas-container py-8 animate-pulse space-y-6">
          <div className="h-24 bg-white border border-gray-100 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-80 bg-white border border-gray-100 rounded-2xl" />
            <div className="h-80 bg-white border border-gray-100 rounded-2xl" />
            <div className="h-80 bg-white border border-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageShell
        title="Tasks"
        subtitle="Manage your daily creator workflow like a real SaaS project board."
        right={
          <>
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
            <label className="text-sm text-gray-600">Search</label>
            <input
              className="input mt-2"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Status</label>
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
            <label className="text-sm text-gray-600">Priority</label>
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
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={24} />
          </div>
          <p className="text-gray-900 font-bold text-lg">No tasks found</p>
          <p className="text-sm text-gray-500 mt-2">
            Stay organized by adding tasks to your creative queue.
          </p>
          <button className="btn-primary mt-6" onClick={() => setOpen(true)}>
            ➕ Create task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {["Todo", "Doing", "Done"].map((col) => (
            <div key={col} className="card p-5 border border-gray-100 bg-gray-50/30">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-900 font-bold text-lg">{col}</p>
                <span className="badge badge-indigo">{grouped[col]?.length || 0}</span>
              </div>

              <div className="divider mb-4" />

              <div className="space-y-3">
                {grouped[col]?.map((t) => (
                  <div
                    key={t._id}
                    className="rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-sm transition group"
                  >
                    <p className="text-gray-900 font-semibold leading-relaxed">{t.title}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={statusBadge(getStatusText(t))}>{getStatusText(t)}</span>
                      <span className={priorityBadge(t.priority)}>
                        {t.priority}
                      </span>
                      <span className="badge border-gray-100 bg-gray-50 text-gray-500 flex items-center gap-1">
                        <Clock size={10} /> {getFriendlyDueText(t.dueDate)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gray-50 opacity-90 group-hover:opacity-100 transition-opacity">
                      {getStatusText(t) !== "Todo" && (
                        <button
                          className="btn-secondary text-xs px-2.5 py-1"
                          onClick={() => updateTaskStatus(t._id, "Todo")}
                        >
                          ↩ Todo
                        </button>
                      )}

                      {getStatusText(t) !== "Doing" && (
                        <button
                          className="btn-secondary text-xs px-2.5 py-1"
                          onClick={() => updateTaskStatus(t._id, "Doing")}
                        >
                          ▶ Doing
                        </button>
                      )}

                      {getStatusText(t) !== "Done" && (
                        <button
                          className="btn-primary text-xs px-2.5 py-1"
                          onClick={() => updateTaskStatus(t._id, "Done")}
                        >
                          ✅ Done
                        </button>
                      )}

                      <button
                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded ml-auto transition"
                        onClick={() => deleteTask(t._id)}
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-lg card p-6 animate-pop-in border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Task</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create a new task and track progress.
                </p>
              </div>

              <button className="text-gray-400 hover:text-gray-900" onClick={() => setOpen(false)}>
                ✖
              </button>
            </div>

            <div className="divider my-6" />

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Task title</label>
                <input
                  className="input mt-2"
                  placeholder="Example: Edit reel for Nike campaign"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Status</label>
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
                  <label className="text-sm text-gray-600">Priority</label>
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
                  <label className="text-sm text-gray-600">Due</label>
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

              <button className="btn-primary w-full py-3" disabled={createApi.loading}>
                {createApi.loading ? "Creating..." : "✅ Add Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
