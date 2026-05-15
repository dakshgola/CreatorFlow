import React, { useMemo, useState } from "react";
import PageShell from "../components/PageShell";

const Clients = () => {
  // Demo data (replace later with API)
  const [clients, setClients] = useState([
    {
      id: "1",
      name: "Nike India",
      category: "Sports",
      platform: "Instagram",
      status: "Active",
      budget: 50000,
      lastUpdate: "2h ago",
    },
    {
      id: "2",
      name: "Boat Lifestyle",
      category: "Tech",
      platform: "YouTube",
      status: "Pending",
      budget: 20000,
      lastUpdate: "1 day ago",
    },
    {
      id: "3",
      name: "Zomato",
      category: "Food",
      platform: "Instagram",
      status: "Closed",
      budget: 35000,
      lastUpdate: "1 week ago",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state
  const [open, setOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    category: "",
    platform: "Instagram",
    status: "Active",
    budget: "",
  });

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.platform.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" ? true : c.status.toLowerCase() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [clients, search, statusFilter]);

  const statusBadge = (status) => {
    if (status === "Active") return "badge badge-green";
    if (status === "Pending") return "badge badge-violet";
    return "badge badge-indigo";
  };

  const handleAddClient = (e) => {
    e.preventDefault();

    if (!newClient.name.trim()) return;

    const payload = {
      id: Date.now().toString(),
      name: newClient.name.trim(),
      category: newClient.category.trim() || "General",
      platform: newClient.platform,
      status: newClient.status,
      budget: Number(newClient.budget) || 0,
      lastUpdate: "just now",
    };

    setClients((p) => [payload, ...p]);
    setOpen(false);

    setNewClient({
      name: "",
      category: "",
      platform: "Instagram",
      status: "Active",
      budget: "",
    });
  };

  return (
    <div>
      <PageShell
        title="Brand Clients"
        subtitle="Manage client deals, track status and plan content collaborations like a SaaS CRM."
        right={
          <>
            <button className="btn-secondary" onClick={() => setClients([])}>
              Clear Demo
            </button>
            <button className="btn-primary" onClick={() => setOpen(true)}>
              ➕ Add Client
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Search</label>
            <input
              className="input mt-2"
              placeholder="Search by brand, category, platform..."
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
              <option value="active">active</option>
              <option value="pending">pending</option>
              <option value="closed">closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-gray-100/70 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-gray-900 font-bold text-lg">Clients</p>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredClients.length} of {clients.length}
            </p>
          </div>

          <span className="badge badge-indigo">CRM View</span>
        </div>

        {filteredClients.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-900 font-bold text-lg">No clients found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try changing filters or add a new client.
            </p>

            <button className="btn-primary mt-6" onClick={() => setOpen(true)}>
              ➕ Add your first client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-sm">
              <thead className="bg-white">
                <tr className="text-gray-500">
                  <th className="text-left p-4 font-semibold">Brand</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-left p-4 font-semibold">Platform</th>
                  <th className="text-left p-4 font-semibold">Budget</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Last Update</th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-gray-100/70 hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      <p className="text-gray-900 font-semibold">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Client ID: {c.id}
                      </p>
                    </td>

                    <td className="p-4 text-gray-600">{c.category}</td>
                    <td className="p-4 text-gray-600">{c.platform}</td>
                    <td className="p-4 text-gray-600">
                      ₹{c.budget.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <span className={statusBadge(c.status)}>
                        {c.status}
                      </span>
                    </td>

                    <td className="p-4 text-gray-500">{c.lastUpdate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                <h2 className="text-xl font-bold text-gray-900">Add Client</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add a new brand and start managing deals.
                </p>
              </div>

              <button className="btn-ghost" onClick={() => setOpen(false)}>
                ✖
              </button>
            </div>

            <div className="divider my-6" />

            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Brand Name</label>
                <input
                  className="input mt-2"
                  placeholder="Example: Puma India"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Category</label>
                <input
                  className="input mt-2"
                  placeholder="Example: Fitness / Food / Tech"
                  value={newClient.category}
                  onChange={(e) =>
                    setNewClient((p) => ({ ...p, category: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Platform</label>
                  <select
                    className="input mt-2"
                    value={newClient.platform}
                    onChange={(e) =>
                      setNewClient((p) => ({ ...p, platform: e.target.value }))
                    }
                  >
                    <option>Instagram</option>
                    <option>YouTube</option>
                    <option>Twitter</option>
                    <option>LinkedIn</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <select
                    className="input mt-2"
                    value={newClient.status}
                    onChange={(e) =>
                      setNewClient((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Closed</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Budget (₹)</label>
                  <input
                    className="input mt-2"
                    type="number"
                    placeholder="5000"
                    value={newClient.budget}
                    onChange={(e) =>
                      setNewClient((p) => ({ ...p, budget: e.target.value }))
                    }
                  />
                </div>
              </div>

              <button className="btn-primary w-full py-3">
                ✅ Add Client
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
