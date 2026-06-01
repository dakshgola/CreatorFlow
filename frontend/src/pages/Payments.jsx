import React, { useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import useApi from "../hooks/useApi";
import { toast } from "react-hot-toast";
import { Trash2, CheckCircle2, AlertCircle, HelpCircle, Landmark } from "lucide-react";

const Payments = () => {
  // Fetch payments
  const { data: paymentsData, loading, error, callApi: refetchPayments } = useApi("/api/payments", {
    method: "GET",
    immediate: true
  });

  // Fetch clients to populate the dropdown in the modal
  const { data: clientsData } = useApi("/api/clients", {
    method: "GET",
    immediate: true
  });

  const createApi = useApi("/api/payments", { method: "POST", immediate: false });
  const updateApi = useApi("/api/payments", { method: "PUT", immediate: false });
  const deleteApi = useApi("/api/payments", { method: "DELETE", immediate: false });

  const payments = useMemo(() => {
    return paymentsData?.data || [];
  }, [paymentsData]);

  const clientsList = useMemo(() => {
    return clientsData?.data || [];
  }, [clientsData]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal
  const [open, setOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    clientId: "",
    amount: "",
    status: "Pending",
    due: "This week",
    method: "UPI",
  });

  // Helper to map DB record status to UI expectation
  const getStatusText = (p) => {
    if (p.paid) return "Paid";
    // Check if overdue
    const isOverdue = p.dueDate && new Date(p.dueDate) < new Date();
    return isOverdue ? "Due" : "Pending";
  };

  const getFriendlyDueText = (dateString) => {
    if (!dateString) return "Completed";
    const date = new Date(dateString);
    const diffTime = date.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 4) return "This week";
    return "Next week";
  };

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const clientName = p.clientId?.name || "Unknown Client";
      const matchSearch =
        clientName.toLowerCase().includes(search.toLowerCase()) ||
        newPayment.method.toLowerCase().includes(search.toLowerCase());

      const status = getStatusText(p);
      const matchStatus =
        statusFilter === "all"
          ? true
          : status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [payments, search, statusFilter]);

  const badge = (status) => {
    if (status === "Paid") return "badge badge-green";
    if (status === "Due")
      return "badge border-red-500/30 bg-red-500/10 text-red-600";
    return "badge badge-violet";
  };

  const totals = useMemo(() => {
    const due = payments
      .filter((p) => getStatusText(p) === "Due")
      .reduce((acc, p) => acc + p.amount, 0);

    const pending = payments
      .filter((p) => getStatusText(p) === "Pending")
      .reduce((acc, p) => acc + p.amount, 0);

    const paid = payments
      .filter((p) => getStatusText(p) === "Paid")
      .reduce((acc, p) => acc + p.amount, 0);

    return { due, pending, paid };
  }, [payments]);

  const markPaid = async (id) => {
    const res = await updateApi.callApi({
      endpoint: `/api/payments/${id}`,
      method: "PUT",
      body: { paid: true }
    });

    if (res.success) {
      toast.success("Payment recorded!");
      refetchPayments();
    } else {
      toast.error(res.error || "Failed to mark as paid");
    }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    const res = await deleteApi.callApi({
      endpoint: `/api/payments/${id}`,
      method: "DELETE"
    });
    if (res.success) {
      toast.success("Record deleted");
      refetchPayments();
    } else {
      toast.error(res.error || "Failed to delete record");
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!newPayment.clientId || !newPayment.amount) {
      toast.error("Please select a brand client and input amount.");
      return;
    }

    let dueDate = new Date();
    if (newPayment.due === "Tomorrow") dueDate = new Date(Date.now() + 86400000);
    else if (newPayment.due === "This week") dueDate = new Date(Date.now() + 86400000 * 4);
    else if (newPayment.due === "Next week") dueDate = new Date(Date.now() + 86400000 * 7);

    const body = {
      clientId: newPayment.clientId,
      amount: Number(newPayment.amount) || 0,
      dueDate,
      paid: newPayment.status === "Paid"
    };

    const res = await createApi.callApi({ body });
    if (res.success) {
      toast.success("Payment transaction recorded!");
      setOpen(false);
      refetchPayments();
      setNewPayment({
        clientId: "",
        amount: "",
        status: "Pending",
        due: "This week",
        method: "UPI",
      });
    } else {
      toast.error(res.error || "Failed to add payment record");
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen pb-12">
        <PageShell title="Payments" subtitle="Loading invoice ledger..." />
        <div className="saas-container py-8 animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white border border-gray-100 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-white border border-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageShell
        title="Payments"
        subtitle="Track due payments, pending invoices and payouts like a premium SaaS dashboard."
        right={
          <>
            <button className="btn-primary" onClick={() => setOpen(true)}>
              ➕ Add Payment
            </button>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        <div className="card card-hover p-5 border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Due</span>
            <AlertCircle size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{totals.due.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-medium">Needs immediate follow-up</p>
        </div>

        <div className="card card-hover p-5 border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <HelpCircle size={16} className="text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{totals.pending.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-medium">Waiting confirmation</p>
        </div>

        <div className="card card-hover p-5 border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Collected</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{totals.paid.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-medium">Total collected payout</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-5 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Search</label>
            <input
              className="input mt-2"
              placeholder="Search by brand name..."
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
              <option value="paid">paid</option>
              <option value="pending">pending</option>
              <option value="due">due</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-900 font-bold text-lg">Invoices / Payments</p>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filtered.length} of {payments.length}
            </p>
          </div>
          <span className="badge badge-indigo">Finance Ledger</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Landmark size={24} />
            </div>
            <p className="text-gray-900 font-bold text-lg">No payment records found</p>
            <p className="text-sm text-gray-500 mt-2">
              Add payments or change search queries to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-sm">
              <thead className="bg-white border-b border-gray-100">
                <tr className="text-gray-500">
                  <th className="text-left p-4 font-semibold">Client</th>
                  <th className="text-left p-4 font-semibold">Amount</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Due</th>
                  <th className="text-left p-4 font-semibold">Method</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p._id}
                    className="border-t border-gray-100/70 hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      <p className="text-gray-900 font-semibold">{p.clientId?.name || "Unknown Client"}</p>
                      <p className="text-xs text-gray-400 mt-1">ID: {p._id}</p>
                    </td>

                    <td className="p-4 text-gray-900 font-medium">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <span className={badge(getStatusText(p))}>{getStatusText(p)}</span>
                    </td>

                    <td className="p-4 text-gray-500">
                      {p.paid ? "Completed" : getFriendlyDueText(p.dueDate)}
                    </td>
                    <td className="p-4 text-gray-600">UPI / Bank</td>

                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {!p.paid && (
                          <button
                            className="btn-primary text-xs py-1.5 px-3"
                            onClick={() => markPaid(p._id)}
                            disabled={updateApi.loading}
                          >
                            ✅ Mark Paid
                          </button>
                        )}

                        <button
                          onClick={() => handleDeletePayment(p._id)}
                          disabled={deleteApi.loading}
                          className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition"
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
                <h2 className="text-xl font-bold text-gray-900">Add Payment</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Track client payouts and pending invoices.
                </p>
              </div>

              <button className="text-gray-400 hover:text-gray-900" onClick={() => setOpen(false)}>
                ✖
              </button>
            </div>

            <div className="divider my-6" />

            <form onSubmit={handleAddPayment} className="space-y-4">
              {clientsList.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-sm">
                  ⚠️ You must create a Brand Client inside the CRM page before recording payouts.
                </div>
              ) : (
                <div>
                  <label className="text-sm text-gray-600 font-medium">Select Brand Client</label>
                  <select
                    className="input mt-2"
                    value={newPayment.clientId}
                    onChange={(e) =>
                      setNewPayment((p) => ({ ...p, clientId: e.target.value }))
                    }
                    required
                  >
                    <option value="">-- Choose Brand --</option>
                    {clientsList.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.niche})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600 font-medium">Amount (₹)</label>
                <input
                  className="input mt-2"
                  type="number"
                  placeholder="5000"
                  value={newPayment.amount}
                  onChange={(e) =>
                    setNewPayment((p) => ({ ...p, amount: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600 font-medium">Status</label>
                  <select
                    className="input mt-2"
                    value={newPayment.status}
                    onChange={(e) =>
                      setNewPayment((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <option>Pending</option>
                    <option>Due</option>
                    <option>Paid</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">Due</label>
                  <select
                    className="input mt-2"
                    value={newPayment.due}
                    onChange={(e) =>
                      setNewPayment((p) => ({ ...p, due: e.target.value }))
                    }
                  >
                    <option>Today</option>
                    <option>Tomorrow</option>
                    <option>This week</option>
                    <option>Next week</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">Method</label>
                  <select
                    className="input mt-2"
                    value={newPayment.method}
                    onChange={(e) =>
                      setNewPayment((p) => ({ ...p, method: e.target.value }))
                    }
                  >
                    <option>UPI</option>
                    <option>Bank</option>
                    <option>Cash</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary w-full py-3" disabled={createApi.loading || clientsList.length === 0}>
                {createApi.loading ? "Recording..." : "✅ Record Payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
