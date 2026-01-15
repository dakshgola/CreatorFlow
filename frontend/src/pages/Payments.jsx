import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import React from "react";


const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}${API_BASE_URL.endsWith('/api') ? '' : '/api'}`;

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    dueDate: '',
    paid: false
  });

  useEffect(() => {
    fetchPayments();
    fetchClients();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_URL}/payments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setPayments(data);
      }
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_URL}/clients`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setClients(data);
      }
    } catch (err) {
      // Silently handle client fetch errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Payment added!');
        setShowModal(false);
        setFormData({ clientId: '', amount: '', dueDate: '', paid: false });
        fetchPayments();
      }
    } catch (err) {
      toast.error('Failed to add payment');
    }
  };

  const togglePaid = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_URL}/payments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ paid: !currentStatus })
      });
      if (res.ok) {
        toast.success('Payment updated!');
        fetchPayments();
      }
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const deletePayment = async (id) => {
    if (!confirm('Delete this payment?')) return;
    try {
      const res = await fetch(`${API_URL}/payments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        toast.success('Payment deleted!');
        fetchPayments();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    return client ? client.name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Payments</h1>
            <p className="text-slate-400 text-sm">Track your payments and income from brand clients</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 text-white transition-all duration-200 ease-out flex items-center justify-center space-x-2 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:scale-[1.02]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Payment</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-800 border-t-indigo-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 md:p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg className="w-20 h-20 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No payments yet</h3>
              <p className="text-slate-400 mb-6">Start tracking your income by adding your first payment record.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 text-white transition-all duration-200 ease-out shadow-md shadow-indigo-500/30 hover:shadow-lg hover:scale-[1.02]"
              >
                Add Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {payments.map(payment => (
              <div
                key={payment._id}
                className={`bg-slate-900/60 border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01] transition-all duration-200 ease-out ${
                  payment.paid ? 'border-green-500/30 bg-green-500/5' : 'border-slate-800 border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{getClientName(payment.clientId)}</h3>
                    <p className="text-3xl font-bold text-green-400 mb-2">₹{payment.amount.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-slate-400">
                      Due: {new Date(payment.dueDate).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => togglePaid(payment._id, payment.paid)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ease-out ${
                        payment.paid 
                          ? 'bg-slate-800/50 border border-slate-700 text-slate-300' 
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md shadow-green-500/30 hover:shadow-lg hover:scale-[1.02]'
                      }`}
                    >
                      {payment.paid ? 'Paid ✓' : 'Mark Paid'}
                    </button>
                    <button
                      onClick={() => deletePayment(payment._id)}
                      className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all duration-200 ease-out"
                      aria-label="Delete payment"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Add Payment</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Client <span className="text-red-400">*</span></label>
                <select
                  className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white transition-all duration-200 ease-out"
                  value={formData.clientId}
                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount (₹) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500 transition-all duration-200 ease-out"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Due Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white transition-all duration-200 ease-out"
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 text-white transition-all duration-200 ease-out shadow-md shadow-indigo-500/30 hover:shadow-lg"
                >
                  Add Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800/50 border border-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-800 text-slate-300 transition-all duration-200 ease-out"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Payments;