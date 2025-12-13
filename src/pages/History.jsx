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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">History</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'ai-ideas', 'ai-hooks', 'ai-scripts', 'ai-captions', 'ai-hashtags', 'project', 'client', 'task', 'payment'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded capitalize whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {f.replace('ai-', 'AI ')}
          </button>
        ))}
      </div>

      {/* Loading Spinner */}
      {historyApi.loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* History List */}
      {!historyApi.loading && aiFilteredHistory.length === 0 && (
        <p className="text-center text-gray-400 dark:text-gray-500 mt-10">
          No history found. Start using AI Tools!
        </p>
      )}

      {!historyApi.loading && aiFilteredHistory.length > 0 && (
        <div className="grid gap-4">
          {aiFilteredHistory.map(item => (
            <div 
              key={item._id || item.id} 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-purple-600 dark:text-purple-400 font-bold capitalize">
                    {getHistoryTypeLabel(item)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
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
                      className="bg-green-600 px-4 py-2 rounded font-medium hover:bg-green-700 text-white transition-colors text-sm"
                    >
                      Reuse
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(item.content)}
                    className="bg-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-700 text-white transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              {/* Display metadata if available */}
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  {item.metadata.prompt && <span className="mr-4">Prompt: {item.metadata.prompt}</span>}
                  {item.metadata.topic && <span className="mr-4">Topic: {item.metadata.topic}</span>}
                  {item.metadata.niche && <span className="mr-4">Niche: {item.metadata.niche}</span>}
                  {item.metadata.tone && <span className="mr-4">Tone: {item.metadata.tone}</span>}
                </div>
              )}
              
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
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
