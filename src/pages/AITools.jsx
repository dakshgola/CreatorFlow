import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useApi from '../hooks/useApi';

const AiTools = () => {
  // Check for prefilled data from History page
  const getPrefillData = () => {
    try {
      const prefill = localStorage.getItem('aiToolsPrefill');
      if (prefill) {
        const data = JSON.parse(prefill);
        localStorage.removeItem('aiToolsPrefill'); // Clear after reading
        return data;
      }
    } catch (e) {
      console.error('Error parsing prefill data:', e);
    }
    return null;
  };

  const prefillData = getPrefillData();
  
  const [activeTab, setActiveTab] = useState(prefillData?.tab || 'ideas');
  const [results, setResults] = useState([]);
  const [currentEndpoint, setCurrentEndpoint] = useState(null);
  
  // Form states - initialize with prefill data if available
  const [ideasForm, setIdeasForm] = useState(
    prefillData?.tab === 'ideas' && prefillData.formData 
      ? prefillData.formData 
      : { prompt: '', niche: '', count: 5 }
  );
  const [hooksForm, setHooksForm] = useState(
    prefillData?.tab === 'hooks' && prefillData.formData 
      ? prefillData.formData 
      : { topic: '', count: 5 }
  );
  const [scriptsForm, setScriptsForm] = useState(
    prefillData?.tab === 'scripts' && prefillData.formData 
      ? prefillData.formData 
      : { topic: '', length: 'medium' }
  );
  const [captionsForm, setCaptionsForm] = useState(
    prefillData?.tab === 'captions' && prefillData.formData 
      ? prefillData.formData 
      : { topic: '', tone: 'motivational', count: 3 }
  );
  const [hashtagsForm, setHashtagsForm] = useState(
    prefillData?.tab === 'hashtags' && prefillData.formData 
      ? prefillData.formData 
      : { niche: '', count: 15 }
  );

  // API hooks for each endpoint
  const ideasApi = useApi('/ai/ideas', { method: 'POST', immediate: false });
  const hooksApi = useApi('/ai/hooks', { method: 'POST', immediate: false });
  const scriptsApi = useApi('/ai/scripts', { method: 'POST', immediate: false });
  const captionsApi = useApi('/ai/captions', { method: 'POST', immediate: false });
  const hashtagsApi = useApi('/ai/hashtags', { method: 'POST', immediate: false });
  const projectsApi = useApi('/projects', { method: 'POST', immediate: false });

  // Get the current API hook based on active tab
  const getCurrentApi = () => {
    switch (activeTab) {
      case 'ideas': return ideasApi;
      case 'hooks': return hooksApi;
      case 'scripts': return scriptsApi;
      case 'captions': return captionsApi;
      case 'hashtags': return hashtagsApi;
      default: return null;
    }
  };

  const currentApi = getCurrentApi();
  const loading = currentApi?.loading || false;

  // Handle AI generation
  const handleGenerate = async () => {
    let body = {};
    let endpoint = '';

    switch (activeTab) {
      case 'ideas':
        if (!ideasForm.prompt || !ideasForm.niche) {
          toast.error('Please fill in prompt and niche');
          return;
        }
        body = {
          prompt: ideasForm.prompt,
          niche: ideasForm.niche,
          count: parseInt(ideasForm.count) || 5
        };
        endpoint = 'ideas';
        setCurrentEndpoint('ideas');
        await ideasApi.callApi({ body });
        break;
      
      case 'hooks':
        if (!hooksForm.topic) {
          toast.error('Please fill in topic');
          return;
        }
        body = {
          topic: hooksForm.topic,
          count: parseInt(hooksForm.count) || 5
        };
        endpoint = 'hooks';
        setCurrentEndpoint('hooks');
        await hooksApi.callApi({ body });
        break;
      
      case 'scripts':
        if (!scriptsForm.topic) {
          toast.error('Please fill in topic');
          return;
        }
        body = {
          topic: scriptsForm.topic,
          length: scriptsForm.length || 'medium'
        };
        endpoint = 'scripts';
        setCurrentEndpoint('scripts');
        await scriptsApi.callApi({ body });
        break;
      
      case 'captions':
        if (!captionsForm.topic) {
          toast.error('Please fill in topic');
          return;
        }
        body = {
          topic: captionsForm.topic,
          tone: captionsForm.tone,
          count: parseInt(captionsForm.count) || 3
        };
        endpoint = 'captions';
        setCurrentEndpoint('captions');
        await captionsApi.callApi({ body });
        break;
      
      case 'hashtags':
        if (!hashtagsForm.niche) {
          toast.error('Please fill in niche');
          return;
        }
        body = {
          niche: hashtagsForm.niche,
          count: parseInt(hashtagsForm.count) || 15
        };
        endpoint = 'hashtags';
        setCurrentEndpoint('hashtags');
        await hashtagsApi.callApi({ body });
        break;
      
      default:
        return;
    }
  };

  // Show toast when prefilled data is loaded
  useEffect(() => {
    if (prefillData) {
      toast.success('Form prefilled from history!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update results when API data changes
  useEffect(() => {
    const api = getCurrentApi();
    
    
    if (api?.data?.success && api.data.data) {
      const responseData = api.data.data;
      let newResults;
      
      // For hashtags, wrap the array in another array so all hashtags appear in one card
      if (currentEndpoint === 'hashtags' && Array.isArray(responseData)) {
        newResults = [responseData];
      } else {
        newResults = Array.isArray(responseData) ? responseData : [responseData];
      }
      
      setResults(newResults);
      if (newResults.length > 0) {
        toast.success('AI generated successfully!');
      }
    } else if (api?.error) {
      toast.error(api.error);
      setResults([]);
    } else if (api?.data && !api.data.success) {
      const errorMsg = api.data.message || api.data.error || 'Request failed';
      toast.error(errorMsg);
      setResults([]);
    }
  }, [ideasApi.data, hooksApi.data, scriptsApi.data, captionsApi.data, hashtagsApi.data, ideasApi.error, hooksApi.error, scriptsApi.error, captionsApi.error, hashtagsApi.error, currentEndpoint]);

  // Save to Planner
  const saveToPlanner = async (item, index) => {
    try {
      let projectData = {
        status: 'Idea'
      };

      // Handle different result types based on endpoint
      switch (currentEndpoint) {
        case 'ideas':
          // Ideas are strings
          projectData.title = `Idea: ${item.substring(0, 50)}${item.length > 50 ? '...' : ''}`;
          projectData.script = item;
          break;
        
        case 'hooks':
          // Hooks are strings
          projectData.title = `Hook: ${item.substring(0, 50)}${item.length > 50 ? '...' : ''}`;
          projectData.script = item;
          break;
        
        case 'scripts':
          // Scripts are strings
          projectData.title = 'AI Generated Script';
          projectData.script = item;
          break;
        
        case 'captions':
          // Captions are strings
          projectData.title = `Caption: ${item.substring(0, 50)}${item.length > 50 ? '...' : ''}`;
          projectData.captions = [item];
          break;
        
        case 'hashtags':
          // Hashtags: results array contains one item which is an array of strings
          projectData.title = 'AI Generated Hashtags';
          if (Array.isArray(item)) {
            projectData.hashtags = item;
          } else {
            projectData.hashtags = [item];
          }
          break;
        
        default:
          // Fallback
          projectData.title = typeof item === 'string' ? `AI Generated: ${item.substring(0, 50)}` : 'AI Generated';
          projectData.script = typeof item === 'string' ? item : JSON.stringify(item);
      }

      const result = await projectsApi.callApi({ body: projectData });
      
      if (result.success) {
        toast.success('Saved to Planner!');
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch (err) {
      toast.error('Error saving to planner');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (item) => {
    let textToCopy = '';
    
    switch (currentEndpoint) {
      case 'ideas':
        // Ideas are strings
        textToCopy = item;
        break;
      case 'hooks':
        // Hooks are strings
        textToCopy = item;
        break;
      case 'scripts':
        // Scripts are strings
        textToCopy = item;
        break;
      case 'captions':
        // Captions are strings
        textToCopy = item;
        break;
      case 'hashtags':
        // For hashtags, item is an array of strings
        const hashtags = Array.isArray(item) ? item : [item];
        textToCopy = hashtags.map(tag => `#${tag}`).join(' ');
        break;
      default:
        textToCopy = typeof item === 'string' ? item : JSON.stringify(item, null, 2);
    }

    navigator.clipboard.writeText(textToCopy);
    toast.success('Copied to clipboard!');
  };

  // Format result for display
  const formatResult = (item) => {
    switch (currentEndpoint) {
      case 'ideas':
        // Ideas are strings from backend
        return <p className="text-gray-200 whitespace-pre-wrap">{item}</p>;
      
      case 'hooks':
        // Hooks are strings
        return <p className="text-gray-200">{item}</p>;
      
      case 'scripts':
        // Scripts are strings
        return <pre className="text-gray-200 whitespace-pre-wrap text-sm">{item}</pre>;
      
      case 'captions':
        // Captions are strings
        return <p className="text-gray-200">{item}</p>;
      
      case 'hashtags':
        // For hashtags, the item itself is an array of strings
        const hashtagArray = Array.isArray(item) ? item : [item];
        return (
          <div className="flex flex-wrap gap-2">
            {hashtagArray.map((tag, idx) => (
              <span key={idx} className="bg-purple-600 px-3 py-1 rounded-full text-sm text-white">
                #{tag}
              </span>
            ))}
          </div>
        );
      
      default:
        return <pre className="whitespace-pre-wrap text-sm">{typeof item === 'string' ? item : JSON.stringify(item, null, 2)}</pre>;
    }
  };


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">AI Tools</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['ideas', 'hooks', 'scripts', 'captions', 'hashtags'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setResults([]);
              setCurrentEndpoint(null);
            }}
            className={`px-4 py-2 rounded capitalize whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ideas Tab */}
      {activeTab === 'ideas' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Generate Ideas</h2>
          <input
            type="text"
            placeholder="Prompt (e.g., trending topics)"
            className="w-full p-3 mb-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500"
            value={ideasForm.prompt}
            onChange={e => setIdeasForm({...ideasForm, prompt: e.target.value})}
          />
          <input
            type="text"
            placeholder="Niche (e.g., fitness, tech)"
            className="w-full p-3 mb-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500"
            value={ideasForm.niche}
            onChange={e => setIdeasForm({...ideasForm, niche: e.target.value})}
          />
          <input
            type="number"
            placeholder="Count"
            min="1"
            max="20"
            className="w-full p-3 mb-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500"
            value={ideasForm.count}
            onChange={e => setIdeasForm({...ideasForm, count: e.target.value})}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-purple-600 py-3 rounded font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Ideas'}
          </button>
        </div>
      )}

      {/* Hooks Tab */}
      {activeTab === 'hooks' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Generate Hooks</h2>
          <input
            type="text"
            placeholder="Topic"
            className="w-full p-3 mb-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500"
            value={hooksForm.topic}
            onChange={e => setHooksForm({...hooksForm, topic: e.target.value})}
          />
          <input
            type="number"
            placeholder="Count"
            min="1"
            max="20"
            className="w-full p-3 mb-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500"
            value={hooksForm.count}
            onChange={e => setHooksForm({...hooksForm, count: e.target.value})}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-purple-600 py-3 rounded font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Hooks'}
          </button>
        </div>
      )}

      {/* Scripts Tab */}
      {activeTab === 'scripts' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Generate Script</h2>
          <input
            type="text"
            placeholder="Topic"
            className="w-full p-3 mb-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500"
            value={scriptsForm.topic}
            onChange={e => setScriptsForm({...scriptsForm, topic: e.target.value})}
          />
          <select
            className="w-full p-3 mb-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
            value={scriptsForm.length}
            onChange={e => setScriptsForm({...scriptsForm, length: e.target.value})}
          >
            <option value="short">Short (200-300 words)</option>
            <option value="medium">Medium (500-700 words)</option>
            <option value="long">Long (1000-1500 words)</option>
          </select>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-purple-600 py-3 rounded font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Script'}
          </button>
        </div>
      )}

      {/* Captions Tab */}
      {activeTab === 'captions' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Generate Captions</h2>
          <input
            type="text"
            placeholder="Topic"
            className="w-full p-3 mb-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500"
            value={captionsForm.topic}
            onChange={e => setCaptionsForm({...captionsForm, topic: e.target.value})}
          />
          <select
            className="w-full p-3 mb-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
            value={captionsForm.tone}
            onChange={e => setCaptionsForm({...captionsForm, tone: e.target.value})}
          >
            <option value="motivational">Motivational</option>
            <option value="funny">Funny</option>
            <option value="informative">Informative</option>
            <option value="engaging">Engaging</option>
          </select>
          <input
            type="number"
            placeholder="Count"
            min="1"
            max="20"
            className="w-full p-3 mb-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500"
            value={captionsForm.count}
            onChange={e => setCaptionsForm({...captionsForm, count: e.target.value})}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-purple-600 py-3 rounded font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Captions'}
          </button>
        </div>
      )}

      {/* Hashtags Tab */}
      {activeTab === 'hashtags' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Generate Hashtags</h2>
          <input
            type="text"
            placeholder="Niche"
            className="w-full p-3 mb-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500"
            value={hashtagsForm.niche}
            onChange={e => setHashtagsForm({...hashtagsForm, niche: e.target.value})}
          />
          <input
            type="number"
            placeholder="Count"
            min="1"
            max="50"
            className="w-full p-3 mb-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500"
            value={hashtagsForm.count}
            onChange={e => setHashtagsForm({...hashtagsForm, count: e.target.value})}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-purple-600 py-3 rounded font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Hashtags'}
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Results</h2>
          <div className="grid gap-4">
            {results.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="mb-4 dark:text-gray-200">
                  {formatResult(item)}
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => saveToPlanner(item, idx)}
                    className="bg-green-600 px-4 py-2 rounded font-medium hover:bg-green-700 text-white transition-colors"
                  >
                    Save to Planner
                  </button>
                  <button
                    onClick={() => copyToClipboard(item)}
                    className="bg-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-700 text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiTools;
