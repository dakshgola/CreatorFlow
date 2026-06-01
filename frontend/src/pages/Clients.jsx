import React, { useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import useApi from "../hooks/useApi";
import { toast } from "react-hot-toast";
import { Trash2, Plus, Search, Briefcase } from "lucide-react";

const Clients = () => {
  const { data: listData, loading, error, callApi: refetchClients } = useApi("/api/clients", {
    method: "GET",
    immediate: true
  });

  const createApi = useApi("/api/clients", { method: "POST", immediate: false });
  const deleteApi = useApi("/api/clients", { method: "DELETE", immediate: false });

  const clients = useMemo(() => {
    return listData?.data || [];
  }, [listData]);

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
        c.niche.toLowerCase().includes(search.toLowerCase()) ||
        (c.links && c.links[0]?.platform.toLowerCase().includes(search.toLowerCase()));

      // Extract status from notes fallback, default to Active
      const status = c.notes?.startsWith("Status: ") ? c.notes.replace("Status: ", "") : "Active";
      const matchStatus =
        statusFilter === "all" ? true : status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [clients, search, statusFilter]);

  const statusBadge = (notesString) => {
    const status = notesString?.startsWith("Status: ") ? notesString.replace("Status: ", "") : "Active";
    if (status === "Active") return "badge badge-green";
    if (status === "Pending") return "badge badge-violet";
    return "badge badge-indigo";
  };

  const getStatusText = (notesString) => {
    return notesString?.startsWith("Status: ") ? notesString.replace("Status: ", "") : "Active";
  };

  const handleAddClient = async (e) => {
    e.preventDefault();

    if (!newClient.name.trim() || !newClient.category.trim() || !newClient.budget) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const body = {
      name: newClient.name.trim(),
      niche: newClient.category.trim(),
      paymentRate: Number(newClient.budget) || 0,
      links: [{ platform: newClient.platform, url: "https://example.com" }],
      notes: `Status: ${newClient.status}`
    };

    const res = await createApi.callApi({ body });
    if (res.success) {
      toast.success("Client added successfully!");
      setOpen(false);
      refetchClients();
      setNewClient({
        name: "",
        category: "",
        platform: "Instagram",
        status: "Active",
        budget: "",
      });
    } else {
      toast.error(res.error || "Failed to add client");
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand client?")) return;
    const res = await deleteApi.callApi({
      endpoint: `/api/clients/${id}`,
      method: "DELETE"
    });
    if (res.success) {
      toast.success("Client removed!");
      refetchClients();
    } else {
      toast.error(res.error || "Failed to remove client");
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen pb-12">
        <PageShell title="Brand Clients" subtitle="Loading client deals..." />
        <div className="saas-container py-8 animate-pulse space-y-6">
          <div className="h-24 bg-white border border-gray-100 rounded-2xl" />
          <div className="h-64 bg-white border border-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageShell
        title="Brand Clients"
        subtitle="Manage client deals, track status and plan content collaborations like a SaaS CRM."
        right={
          <>
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
              placeholder="Search by brand, niche..."
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
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase size={24} />
            </div>
            <p className="text-gray-900 font-bold text-lg">No clients found</p>
            <p className="text-sm text-gray-500 mt-2">
              Start building your active brand collaborations database.
            </p>

            <button className="btn-primary mt-6" onClick={() => setOpen(true)}>
              ➕ Add your first client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-sm">
              <thead className="bg-white border-b border-gray-100">
                <tr className="text-gray-500">
                  <th className="text-left p-4 font-semibold">Brand</th>
                  <th className="text-left p-4 font-semibold">Niche / Category</th>
                  <th className="text-left p-4 font-semibold">Platform</th>
                  <th className="text-left p-4 font-semibold">Payment Rate</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Last Update</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-gray-100/70 hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      <p className="text-gray-900 font-semibold">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        ID: {c._id}
                      </p>
                    </td>

                    <td className="p-4 text-gray-600">{c.niche}</td>
                    <td className="p-4 text-gray-600">{c.links && c.links[0]?.platform || "Instagram"}</td>
                    <td className="p-4 text-gray-600 font-medium">
                      ₹{c.paymentRate.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <span className={statusBadge(c.notes)}>
                        {getStatusText(c.notes)}
                      </span>
                    </td>

                    <td className="p-4 text-gray-500">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </td>
                    
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteClient(c._id)}
                        disabled={deleteApi.loading}
                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition"
                        title="Delete Client"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-lg card p-6 animate-pop-in border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Client</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add a new brand and start managing deals.
                </p>
              </div>

              <button className="text-gray-400 hover:text-gray-900" onClick={() => setOpen(false)}>
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
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Category / Niche</label>
                <input
                  className="input mt-2"
                  placeholder="Example: Fitness / Food / Tech"
                  value={newClient.category}
                  onChange={(e) =>
                    setNewClient((p) => ({ ...p, category: e.target.value }))
                  }
                  required
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
                    required
                  />
                </div>
              </div>

              <button className="btn-primary w-full py-3" disabled={createApi.loading}>
                {createApi.loading ? "Adding..." : "✅ Add Client"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
