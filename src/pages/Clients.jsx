import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useApi from '../hooks/useApi.js';

const Clients = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    paymentRate: '',
    notes: '',
    links: [],
  });
  const [linkInput, setLinkInput] = useState({ platform: '', url: '' });

  // Fetch clients
  const { data: clientsData, loading, error, callApi: fetchClients } = useApi('/clients', {
    immediate: true,
  });

  // Create client
  const { callApi: createClient, loading: creating } = useApi('/clients', {
    method: 'POST',
  });

  // Update client
  const { callApi: updateClient, loading: updating } = useApi('', {
    method: 'PUT',
  });

  // Delete client
  const { callApi: deleteClient, loading: deleting } = useApi('', {
    method: 'DELETE',
  });

  const clients = clientsData?.data || [];

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'paymentRate' ? parseFloat(value) || 0 : value,
    }));
  };

  // Add link to form
  const handleAddLink = () => {
    if (linkInput.platform && linkInput.url) {
      setFormData((prev) => ({
        ...prev,
        links: [...prev.links, { ...linkInput }],
      }));
      setLinkInput({ platform: '', url: '' });
    }
  };

  // Remove link from form
  const handleRemoveLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  // Open modal for adding new client
  const handleAddClient = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      niche: '',
      paymentRate: '',
      notes: '',
      links: [],
    });
    setLinkInput({ platform: '', url: '' });
    setIsModalOpen(true);
  };

  // Open modal for editing client
  const handleEditClient = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      niche: client.niche || '',
      paymentRate: client.paymentRate || '',
      notes: client.notes || '',
      links: client.links || [],
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.niche || !formData.paymentRate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingClient) {
        // Update existing client
        const result = await updateClient({
          endpoint: `/clients/${editingClient._id}`,
          body: formData,
        });

        if (result.success) {
          toast.success('Client updated successfully');
          setIsModalOpen(false);
          fetchClients();
        } else {
          toast.error(result.error || 'Failed to update client');
        }
      } else {
        // Create new client
        const result = await createClient({
          body: formData,
        });

        if (result.success) {
          toast.success('Client created successfully');
          setIsModalOpen(false);
          setFormData({
            name: '',
            niche: '',
            paymentRate: '',
            notes: '',
            links: [],
          });
          fetchClients();
        } else {
          toast.error(result.error || 'Failed to create client');
        }
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    }
  };

  // Handle delete client
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      const result = await deleteClient({
        endpoint: `/clients/${clientId}`,
      });

      if (result.success) {
        toast.success('Client deleted successfully');
        fetchClients();
      } else {
        toast.error(result.error || 'Failed to delete client');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    }
  };

  // Format currency (Indian Rupees)
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-800 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading brand clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Brand Clients
            </h1>
            <p className="text-slate-400 text-sm">
              Manage your brand relationships and track payments
            </p>
          </div>
          <button
            onClick={handleAddClient}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-200 ease-out flex items-center justify-center space-x-2 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add Client</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-800/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                  >
                    Niche
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                  >
                    Payment Rate
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900/60 divide-y divide-slate-800">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8">
                        <p className="text-slate-400 text-lg">No brand clients yet ? your first brand deal is coming ??</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr
                      key={client._id}
                      className="hover:bg-slate-800/50 transition-colors duration-200 ease-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {client.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                          {client.niche}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-semibold">
                          {formatCurrency(client.paymentRate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClient(client)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                            title="Edit"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client._id)}
                            disabled={deleting}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors duration-200"
                            title="Delete"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {clients.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-lg">No brand clients yet — your first brand deal is coming 💼</p>
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client._id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01] transition-all duration-200 ease-out"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {client.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client._id)}
                      disabled={deleting}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors duration-200"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm text-slate-300">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span>{client.niche}</span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {formatCurrency(client.paymentRate)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  {editingClient ? 'Edit Brand Client' : 'Add New Brand Client'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500 transition-all duration-200 ease-out"
                    placeholder="Brand or client name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Niche <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="niche"
                    value={formData.niche}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500 transition-all duration-200 ease-out"
                    placeholder="e.g., Tech, Fashion, Food"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Payment Rate (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="paymentRate"
                    value={formData.paymentRate}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500 transition-all duration-200 ease-out"
                    placeholder="Enter amount in ₹"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500 transition-all duration-200 ease-out resize-none"
                    placeholder="Additional notes about this brand client"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Links
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Platform (e.g., Instagram)"
                        value={linkInput.platform}
                        onChange={(e) =>
                          setLinkInput({ ...linkInput, platform: e.target.value })
                        }
                        className="flex-1 p-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500 transition-all duration-200 ease-out"
                      />
                      <input
                        type="url"
                        placeholder="URL"
                        value={linkInput.url}
                        onChange={(e) =>
                          setLinkInput({ ...linkInput, url: e.target.value })
                        }
                        className="flex-1 p-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-500 transition-all duration-200 ease-out"
                      />
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-all duration-200 ease-out font-medium"
                      >
                        Add
                      </button>
                    </div>
                    {formData.links.length > 0 && (
                      <div className="space-y-2">
                        {formData.links.map((link, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-slate-800/50 border border-slate-700 px-3 py-2 rounded-xl"
                          >
                            <span className="text-sm text-slate-300">
                              <strong>{link.platform}:</strong> {link.url}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(index)}
                              className="text-red-400 hover:text-red-300 transition-colors duration-200"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-all duration-200 ease-out font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out font-semibold shadow-md shadow-indigo-500/30 hover:shadow-lg"
                  >
                    {creating || updating
                      ? 'Saving...'
                      : editingClient
                      ? 'Update Client'
                      : 'Create Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
