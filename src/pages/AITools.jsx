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
      // Silently handle prefill data parsing errors
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
      
      // For hashtags, backend returns array directly - wrap in array for consistent display
      if (currentEndpoint === 'hashtags') {
        if (Array.isArray(responseData)) {
          newResults = [responseData];
        } else {
          newResults = [Array.isArray(responseData) ? responseData : [responseData]];
        }
      } else {
        newResults = Array.isArray(responseData) ? responseData : [responseData];
      }
      
      setResults(newResults);
      if (newResults.length > 0) {
        toast.success('AI generated successfully!');
      }
    } else if (api?.error) {
      toast.error(api.error || 'Failed to generate content');
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
        return <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{item}</p>;
      
      case 'hooks':
        // Hooks are strings
        return <p className="text-slate-300 leading-relaxed">{item}</p>;
      
      case 'scripts':
        // Scripts are strings
        return <pre className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed font-sans">{item}</pre>;
      
      case 'captions':
        // Captions are strings
        return <p className="text-slate-300 leading-relaxed">{item}</p>;
      
      case 'hashtags':
        // For hashtags, the item itself is an array of strings
        const hashtagArray = Array.isArray(item) ? item : [item];
        return (
          <div className="flex flex-wrap gap-2">
            {hashtagArray.map((tag, idx) => (
              <span 
                key={idx} 
                className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 rounded-full text-sm font-medium text-white shadow-sm hover:scale-110 transition-all duration-200 cursor-default"
              >
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto bg-slate-950 min-h-screen">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">AI Tools</h1>
        <p className="text-slate-400 text-sm">Built for Indian creators 🇮🇳 • Optimized for Reels, Shorts & Indian social media trends</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['ideas', 'hooks', 'scripts', 'captions', 'hashtags'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setResults([]);
              setCurrentEndpoint(null);
            }}
            className={`px-5 py-2.5 rounded-xl capitalize whitespace-nowrap transition-all duration-200 ease-out font-medium text-sm ${
              activeTab === tab 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30' 
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ideas Tab */}
      {activeTab === 'ideas' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-6 text-white">Generate Ideas</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
              <input
                type="text"
                placeholder="Generate Instagram Reel ideas for Indian audience"
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={ideasForm.prompt}
                onChange={e => setIdeasForm({...ideasForm, prompt: e.target.value})}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Niche</label>
              <input
                type="text"
                placeholder="e.g., fitness, tech, lifestyle"
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={ideasForm.niche}
                onChange={e => setIdeasForm({...ideasForm, niche: e.target.value})}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Count</label>
              <input
                type="number"
                placeholder="Number of ideas"
                min="1"
                max="20"
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={ideasForm.count}
                onChange={e => setIdeasForm({...ideasForm, count: e.target.value})}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 ease-out shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Ideas'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hooks Tab */}
      {activeTab === 'hooks' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-6 text-white">Generate Hooks</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
              <input
                type="text"
                placeholder="Create YouTube Shorts hooks for Indian creators"
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={hooksForm.topic}
                onChange={e => setHooksForm({...hooksForm, topic: e.target.value})}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Count</label>
              <input
                type="number"
                placeholder="Number of hooks"
                min="1"
                max="20"
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={hooksForm.count}
                onChange={e => setHooksForm({...hooksForm, count: e.target.value})}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 ease-out shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Hooks'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Scripts Tab */}
      {activeTab === 'scripts' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-6 text-white">Generate Script</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
              <input
                type="text"
                placeholder="Enter your topic"
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={scriptsForm.topic}
                onChange={e => setScriptsForm({...scriptsForm, topic: e.target.value})}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Length</label>
              <select
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={scriptsForm.length}
                onChange={e => setScriptsForm({...scriptsForm, length: e.target.value})}
                disabled={loading}
              >
                <option value="short">Short (200-300 words)</option>
                <option value="medium">Medium (500-700 words)</option>
                <option value="long">Long (1000-1500 words)</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 ease-out shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Script'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Captions Tab */}
      {activeTab === 'captions' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-6 text-white">Generate Captions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
              <input
                type="text"
                placeholder="Write captions for Indian brands & startups"
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={captionsForm.topic}
                onChange={e => setCaptionsForm({...captionsForm, topic: e.target.value})}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tone</label>
              <select
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={captionsForm.tone}
                onChange={e => setCaptionsForm({...captionsForm, tone: e.target.value})}
                disabled={loading}
              >
                <option value="motivational">Motivational</option>
                <option value="funny">Funny</option>
                <option value="informative">Informative</option>
                <option value="engaging">Engaging</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Count</label>
              <input
                type="number"
                placeholder="Number of captions"
                min="1"
                max="20"
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={captionsForm.count}
                onChange={e => setCaptionsForm({...captionsForm, count: e.target.value})}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 ease-out shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Captions'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hashtags Tab */}
      {activeTab === 'hashtags' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-6 text-white">Generate Hashtags</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Niche</label>
              <input
                type="text"
                placeholder="e.g., fitness, tech, lifestyle"
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={hashtagsForm.niche}
                onChange={e => setHashtagsForm({...hashtagsForm, niche: e.target.value})}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Count</label>
              <input
                type="number"
                placeholder="Number of hashtags"
                min="1"
                max="50"
                className="w-full p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                value={hashtagsForm.count}
                onChange={e => setHashtagsForm({...hashtagsForm, count: e.target.value})}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 ease-out shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Hashtags'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-800 border-t-indigo-600"></div>
            <p className="text-slate-400 text-sm font-medium">Generating your content...</p>
          </div>
        </div>
      )}

      {/* Empty State - Before Generation */}
      {!loading && results.length === 0 && !currentEndpoint && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 md:p-16 text-center animate-fade-in">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No content generated yet</h3>
            <p className="text-slate-400">Let's create your first viral idea for Indian audiences 🚀</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && results.length === 0 && currentEndpoint && getCurrentApi()?.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <p className="text-red-400 font-medium">Failed to generate content. Please try again.</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Results</h2>
            <span className="text-sm text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-full">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </span>
          </div>
          <div className="grid gap-6">
            {results.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-out opacity-0 animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="mb-6 text-slate-300">
                  {formatResult(item)}
                </div>
                <div className="flex gap-3 pt-6 border-t border-slate-800">
                  <button
                    onClick={() => saveToPlanner(item, idx)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save to Planner
                  </button>
                  <button
                    onClick={() => copyToClipboard(item)}
                    className="flex-1 bg-slate-800/50 border border-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 hover:scale-[1.02] text-slate-300 transition-all duration-200 ease-out"
                  >
                    {currentEndpoint === 'hashtags' ? 'Copy All Hashtags' : 'Copy'}
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
