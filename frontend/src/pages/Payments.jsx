import React, { useMemo, useState } from "react";
import PageShell from "../components/PageShell";

const Payments = () => {
  const [payments, setPayments] = useState([
    {
      id: "pay1",
      client: "Nike India",
      amount: 15000,
      status: "Pending",
      due: "Today",
      method: "UPI",
    },
    {
      id: "pay2",
      client: "Boat Lifestyle",
      amount: 22000,
      status: "Due",
      due: "Tomorrow",
      method: "Bank",
    },
    {
      id: "pay3",
      client: "Zomato",
      amount: 35000,
      status: "Paid",
      due: "Completed",
      method: "UPI",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal
  const [open, setOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    client: "",
    amount: "",
    status: "Pending",
    due: "This week",
    method: "UPI",
  });

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.client.toLowerCase().includes(search.toLowerCase()) ||
        p.method.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all"
          ? true
          : p.status.toLowerCase() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [payments, search, statusFilter]);

  const badge = (status) => {
    if (status === "Paid") return "badge badge-green";
    if (status === "Due")
      return "badge border-red-500/30 bg-red-500/10 text-red-200";
    return "badge badge-violet";
  };

  const totals = useMemo(() => {
    const due = payments
      .filter((p) => p.status === "Due")
      .reduce((acc, p) => acc + p.amount, 0);

    const pending = payments
      .filter((p) => p.status === "Pending")
      .reduce((acc, p) => acc + p.amount, 0);

    const paid = payments
      .filter((p) => p.status === "Paid")
      .reduce((acc, p) => acc + p.amount, 0);

    return { due, pending, paid };
  }, [payments]);

  const markPaid = (id) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Paid", due: "Completed" } : p))
    );
  };

  const deletePayment = (id) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!newPayment.client.trim() || !newPayment.amount) return;

    const payload = {
      id: Date.now().toString(),
      client: newPayment.client.trim(),
      amount: Number(newPayment.amount) || 0,
      status: newPayment.status,
      due: newPayment.due,
      method: newPayment.method,
    };

    setPayments((p) => [payload, ...p]);
    setOpen(false);

    setNewPayment({
      client: "",
      amount: "",
      status: "Pending",
      due: "This week",
      method: "UPI",
    });
  };

  return (
    <div>
      <PageShell
        title="Payments"
        subtitle="Track due payments, pending invoices and payouts like a premium SaaS dashboard."
        right={
          <>
            <button className="btn-secondary" onClick={() => setPayments([])}>
              🧹 Clear Demo
            </button>
            <button className="btn-primary" onClick={() => setOpen(true)}>
              ➕ Add Payment
            </button>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        <div className="card card-hover p-5">
          <p className="text-sm text-slate-400">Due</p>
          <p className="text-3xl font-extrabold text-white mt-2">
            ₹{totals.due.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-2">Needs immediate follow-up</p>
        </div>

        <div className="card card-hover p-5">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="text-3xl font-extrabold text-white mt-2">
            ₹{totals.pending.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-2">Waiting confirmation</p>
        </div>

        <div className="card card-hover p-5">
          <p className="text-sm text-slate-400">Paid</p>
          <p className="text-3xl font-extrabold text-white mt-2">
            ₹{totals.paid.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-2">Total collected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-slate-300">Search</label>
            <input
              className="input mt-2"
              placeholder="Search client or method..."
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
              <option value="paid">paid</option>
              <option value="pending">pending</option>
              <option value="due">due</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-800/70 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg">Invoices / Payments</p>
            <p className="text-sm text-slate-400 mt-1">
              Showing {filtered.length} of {payments.length}
            </p>
          </div>
          <span className="badge badge-indigo">Finance</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-white font-bold text-lg">No payments found</p>
            <p className="text-sm text-slate-400 mt-2">
              Add payments or change filter/search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-saas">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/40">
                <tr className="text-slate-400">
                  <th className="text-left p-4 font-semibold">Client</th>
                  <th className="text-left p-4 font-semibold">Amount</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Due</th>
                  <th className="text-left p-4 font-semibold">Method</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-slate-800/70 hover:bg-slate-900/40 transition"
                  >
                    <td className="p-4">
                      <p className="text-white font-semibold">{p.client}</p>
                      <p className="text-xs text-slate-500 mt-1">ID: {p.id}</p>
                    </td>

                    <td className="p-4 text-slate-300">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <span className={badge(p.status)}>{p.status}</span>
                    </td>

                    <td className="p-4 text-slate-400">{p.due}</td>
                    <td className="p-4 text-slate-300">{p.method}</td>

                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {p.status !== "Paid" && (
                          <button
                            className="btn-primary"
                            onClick={() => markPaid(p.id)}
                          >
                            ✅ Mark Paid
                          </button>
                        )}

                        <button
                          className="btn-danger"
                          onClick={() => deletePayment(p.id)}
                        >
                          🗑 Delete
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
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-lg card p-6 animate-pop-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Add Payment</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Track client payouts and pending invoices.
                </p>
              </div>

              <button className="btn-ghost" onClick={() => setOpen(false)}>
                ✖
              </button>
            </div>

            <div className="divider my-6" />

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Client</label>
                <input
                  className="input mt-2"
                  placeholder="Example: Puma India"
                  value={newPayment.client}
                  onChange={(e) =>
                    setNewPayment((p) => ({ ...p, client: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Amount (₹)</label>
                <input
                  className="input mt-2"
                  type="number"
                  placeholder="5000"
                  value={newPayment.amount}
                  onChange={(e) =>
                    setNewPayment((p) => ({ ...p, amount: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-300">Status</label>
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
                  <label className="text-sm text-slate-300">Due</label>
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
                  <label className="text-sm text-slate-300">Method</label>
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

              <button className="btn-primary w-full py-3">
                ✅ Add Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
