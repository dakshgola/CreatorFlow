import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}${API_BASE_URL.endsWith('/api') ? '' : '/api'}`;

const Planner = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError(null);
      const res = await fetch(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await res.json();
      // Handle both array and object responses safely
      if (Array.isArray(data)) {
        setProjects(data);
      } else if (data && Array.isArray(data.data)) {
        setProjects(data.data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
      setProjects([]); // Ensure projects is always an array
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

  // Ensure projects is always an array for safe rendering
  const safeProjects = Array.isArray(projects) ? projects : [];

  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Content Planner</h1>
            <p className="text-slate-400 text-sm">Plan your first piece of content and track your posting schedule</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 text-white transition-all duration-200 ease-out shadow-md shadow-indigo-500/30 hover:shadow-lg hover:scale-[1.02] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Project</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-800 border-t-indigo-600"></div>
              <p className="text-slate-400 text-sm">Loading your content plans...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <p className="text-red-400 font-medium mb-4">{error}</p>
            <button
              onClick={fetchProjects}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 text-white transition-all duration-200 ease-out"
            >
              Try Again
            </button>
          </div>
        ) : safeProjects.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 md:p-16 text-center animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg className="w-20 h-20 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Plan your first piece of content</h3>
              <p className="text-slate-400 mb-6">Start organizing your content ideas and plan your posting schedule for maximum engagement with Indian audiences.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 text-white transition-all duration-200 ease-out shadow-md shadow-indigo-500/30 hover:shadow-lg hover:scale-[1.02]"
              >
                Create new plan
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {safeProjects.map((project) => {
              if (!project || !project._id) return null; // Skip invalid projects
              return (
                <div 
                  key={project._id} 
                  className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ease-out opacity-0 animate-fade-in"
                  style={{ animationDelay: `${safeProjects.indexOf(project) * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{project.title || 'Untitled Project'}</h3>
                      <p className="text-sm text-slate-400">
                        {project.plannedDate ? new Date(project.plannedDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'No date set'}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <select
                        value={project.status || 'Idea'}
                        onChange={(e) => updateStatus(project._id, e.target.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium text-white ${statusColors[project.status] || statusColors.Idea} border-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]`}
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => deleteProject(project._id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 ease-out hover:scale-110"
                        aria-label="Delete project"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {project.script && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{project.script}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-white">Add Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
                <input
                  type="text"
                  placeholder="Enter project title"
                  className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Script (optional)</label>
                <textarea
                  placeholder="Enter script content"
                  className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out h-32 resize-none"
                  value={formData.script}
                  onChange={e => setFormData({...formData, script: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Planned Date</label>
                <input
                  type="date"
                  className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out"
                  value={formData.plannedDate}
                  onChange={e => setFormData({...formData, plannedDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 text-white transition-all duration-200 ease-out shadow-md shadow-indigo-500/30 hover:shadow-lg"
                >
                  Add Project
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

export default Planner;