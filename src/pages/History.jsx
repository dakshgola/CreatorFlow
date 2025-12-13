import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';

const History = () => {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  
  const historyApi = useApi('/history', { immediate: true });

  // Extract data from API response (history route returns array directly)
  const historyData = Array.isArray(historyApi.data) ? historyApi.data : [];

  // Filter history by type
  const filteredHistory = filter === 'all' 
    ? historyData
    : historyData.filter(h => {
        // Map filter types to history types
        // AI outputs are saved with type 'project' or 'other' in the backend
        if (filter === 'ai-ideas' || filter === 'ai-scripts' || filter === 'ai-captions' || filter === 'ai-hashtags' || filter === 'ai-hooks') {
          return h.type === 'project' || h.type === 'other';
        }
        return h.type === filter;
      });

  // Filter AI-related history items by metadata
  const aiFilteredHistory = filter.startsWith('ai-') 
    ? filteredHistory.filter(h => {
        const metadata = h.metadata || {};
        const filterType = filter.replace('ai-', '');
        
        // Check metadata to determine AI type
        if (filterType === 'ideas' && (metadata.prompt || metadata.niche)) return true;
        if (filterType === 'hooks' && metadata.topic) return true;
        if (filterType === 'scripts' && metadata.topic) return true;
        if (filterType === 'captions' && (metadata.topic || metadata.tone)) return true;
        if (filterType === 'hashtags' && metadata.niche) return true;
        
        return false;
      })
    : filteredHistory;

  useEffect(() => {
    if (historyApi.error) {
      toast.error('Failed to load history');
    }
  }, [historyApi.error]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleReuse = (item) => {
    const metadata = item.metadata || {};
    
    // Determine which tab and form to prefill based on metadata
    let tab = 'ideas';
    let formData = {};
    
    if (metadata.prompt && metadata.niche) {
      // Ideas
      tab = 'ideas';
      formData = {
        prompt: metadata.prompt,
        niche: metadata.niche,
        count: metadata.count || 5
      };
    } else if (metadata.topic && !metadata.tone && !metadata.length) {
      // Hooks
      tab = 'hooks';
      formData = {
        topic: metadata.topic,
        count: metadata.count || 5
      };
    } else if (metadata.topic && metadata.length) {
      // Scripts
      tab = 'scripts';
      formData = {
        topic: metadata.topic,
        length: metadata.length || 'medium'
      };
    } else if (metadata.topic && metadata.tone) {
      // Captions
      tab = 'captions';
      formData = {
        topic: metadata.topic,
        tone: metadata.tone || 'motivational',
        count: metadata.count || 3
      };
    } else if (metadata.niche && !metadata.prompt) {
      // Hashtags
      tab = 'hashtags';
      formData = {
        niche: metadata.niche,
        count: metadata.count || 15
      };
    }
    
    // Store form data in localStorage to be picked up by AITools
    localStorage.setItem('aiToolsPrefill', JSON.stringify({ tab, formData }));
    
    // Navigate to AI Tools
    navigate('/ai-tools');
    toast.success('Form prefilled! Check AI Tools page.');
  };

  const getHistoryTypeLabel = (item) => {
    const metadata = item.metadata || {};
    
    if (metadata.prompt && metadata.niche) return 'AI Ideas';
    if (metadata.topic && !metadata.tone && !metadata.length) return 'AI Hooks';
    if (metadata.topic && metadata.length) return 'AI Scripts';
    if (metadata.topic && metadata.tone) return 'AI Captions';
    if (metadata.niche && !metadata.prompt) return 'AI Hashtags';
    
    return item.type.charAt(0).toUpperCase() + item.type.slice(1);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto bg-slate-950 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">History</h1>
        <p className="text-slate-400 text-sm">View and reuse your saved AI-generated content</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['all', 'ai-ideas', 'ai-hooks', 'ai-scripts', 'ai-captions', 'ai-hashtags', 'project', 'client', 'task', 'payment'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-xl capitalize whitespace-nowrap transition-all duration-200 ease-out font-medium text-sm ${
              filter === f 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30' 
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {f.replace('ai-', 'AI ')}
          </button>
        ))}
      </div>

      {/* Loading Spinner */}
      {historyApi.loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-800 border-t-indigo-600"></div>
        </div>
      )}

      {/* History List */}
      {!historyApi.loading && aiFilteredHistory.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-lg">No history found. Start using AI Tools!</p>
        </div>
      )}

      {!historyApi.loading && aiFilteredHistory.length > 0 && (
        <div className="grid gap-6">
          {aiFilteredHistory.map(item => (
            <div 
              key={item._id || item.id} 
              className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                    {getHistoryTypeLabel(item)}
                  </span>
                  <span className="text-sm text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex gap-2">
                  {/* Show Reuse button only for AI-related history */}
                  {(item.metadata?.prompt || item.metadata?.topic || item.metadata?.niche) && (
                    <button
                      onClick={() => handleReuse(item)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-200 ease-out text-sm shadow-sm hover:shadow-md"
                    >
                      Reuse
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(item.content)}
                    className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-800 text-slate-300 transition-all duration-200 ease-out text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              {/* Display metadata if available */}
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-400">
                  {item.metadata.prompt && <span className="mr-4"><strong>Prompt:</strong> {item.metadata.prompt}</span>}
                  {item.metadata.topic && <span className="mr-4"><strong>Topic:</strong> {item.metadata.topic}</span>}
                  {item.metadata.niche && <span className="mr-4"><strong>Niche:</strong> {item.metadata.niche}</span>}
                  {item.metadata.tone && <span className="mr-4"><strong>Tone:</strong> {item.metadata.tone}</span>}
                </div>
              )}
              
              <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed pt-4 border-t border-slate-800">
                {item.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
