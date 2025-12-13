import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

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
      console.error('Failed to load clients');
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700"
        >
          + Add Payment
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : payments.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">No payments yet. Add one to track income!</p>
      ) : (
        <div className="grid gap-4">
          {payments.map(payment => (
            <div
              key={payment._id}
              className={`p-4 rounded-lg ${
                payment.paid ? 'bg-green-900 bg-opacity-30' : 'bg-red-900 bg-opacity-30'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{getClientName(payment.clientId)}</h3>
                  <p className="text-2xl font-bold text-green-400">${payment.amount}</p>
                  <p className="text-sm text-gray-400">
                    Due: {new Date(payment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => togglePaid(payment._id, payment.paid)}
                    className={`px-4 py-2 rounded ${
                      payment.paid ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {payment.paid ? 'Paid ✓' : 'Mark Paid'}
                  </button>
                  <button
                    onClick={() => deletePayment(payment._id)}
                    className="text-red-500 hover:text-red-400 text-xl"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Payment</h2>
            <form onSubmit={handleSubmit}>
              <select
                className="w-full p-3 mb-3 bg-gray-700 rounded"
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                required
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                className="w-full p-3 mb-3 bg-gray-700 rounded"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />
              <input
                type="date"
                className="w-full p-3 mb-4 bg-gray-700 rounded"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 py-2 rounded hover:bg-purple-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;