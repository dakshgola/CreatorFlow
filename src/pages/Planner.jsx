import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const Planner = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    script: '',
    status: 'Idea',
    plannedDate: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data);
      }
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Project added!');
        setShowModal(false);
        setFormData({ title: '', script: '', status: 'Idea', plannedDate: '' });
        fetchProjects();
      }
    } catch (err) {
      toast.error('Failed to add project');
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        toast.success('Project deleted!');
        fetchProjects();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success('Status updated!');
        fetchProjects();
      }
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const statuses = ['Idea', 'Scripted', 'Shot', 'Edited', 'Posted'];
  const statusColors = {
    Idea: 'bg-gray-600',
    Scripted: 'bg-blue-600',
    Shot: 'bg-yellow-600',
    Edited: 'bg-purple-600',
    Posted: 'bg-green-600'
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Content Planner</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700"
        >
          + Add Project
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">No projects yet. Add one to get started!</p>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => (
            <div key={project._id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  <p className="text-sm text-gray-400">
                    {project.plannedDate && new Date(project.plannedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={project.status}
                    onChange={(e) => updateStatus(project._id, e.target.value)}
                    className={`px-3 py-1 rounded text-sm ${statusColors[project.status]}`}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteProject(project._id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {project.script && (
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{project.script}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Project</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Project Title"
                className="w-full p-3 mb-3 bg-gray-700 rounded"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Script (optional)"
                className="w-full p-3 mb-3 bg-gray-700 rounded h-32"
                value={formData.script}
                onChange={e => setFormData({...formData, script: e.target.value})}
              />
              <input
                type="date"
                className="w-full p-3 mb-3 bg-gray-700 rounded"
                value={formData.plannedDate}
                onChange={e => setFormData({...formData, plannedDate: e.target.value})}
              />
              <select
                className="w-full p-3 mb-4 bg-gray-700 rounded"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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

export default Planner;