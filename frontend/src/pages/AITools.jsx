import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useApi from "../hooks/useApi";
import PageShell from "../components/PageShell";

const AITools = () => {
  // =============================
  // Prefill from History (optional)
  // =============================
  const getPrefillData = () => {
    try {
      const prefill = localStorage.getItem("aiToolsPrefill");
      if (prefill) {
        const data = JSON.parse(prefill);
        localStorage.removeItem("aiToolsPrefill");
        return data;
      }
    } catch (e) {}
    return null;
  };

  const prefillData = getPrefillData();

  // =============================
  // State
  // =============================
  const [activeTab, setActiveTab] = useState(prefillData?.tab || "generator");
  const [results, setResults] = useState([]);
  const [generatorResult, setGeneratorResult] = useState(null);
  const [currentEndpoint, setCurrentEndpoint] = useState(null);

  // =============================
  // Forms
  // =============================
  const [generatorForm, setGeneratorForm] = useState({ topic: "", niche: "Tech", platform: "YouTube" });

  const [ideasForm, setIdeasForm] = useState(
    prefillData?.tab === "ideas" && prefillData.formData
      ? prefillData.formData
      : { prompt: "", niche: "", count: 5 }
  );

  const [hooksForm, setHooksForm] = useState(
    prefillData?.tab === "hooks" && prefillData.formData
      ? prefillData.formData
      : { topic: "", count: 5 }
  );

  const [scriptsForm, setScriptsForm] = useState(
    prefillData?.tab === "scripts" && prefillData.formData
      ? prefillData.formData
      : { topic: "", length: "medium" }
  );

  const [captionsForm, setCaptionsForm] = useState(
    prefillData?.tab === "captions" && prefillData.formData
      ? prefillData.formData
      : { topic: "", tone: "motivational", count: 3 }
  );

  // =============================
  // APIs — ✅ FIXED: added /api/ prefix to all endpoints
  // =============================
  const generateApi = useApi("/api/ai/generate", { method: "POST", immediate: false });
  const historyApi = useApi("/api/ai/generate", { method: "GET", immediate: true });
  
  const ideasApi = useApi("/api/ai/ideas", { method: "POST", immediate: false });
  const hooksApi = useApi("/api/ai/hooks", { method: "POST", immediate: false });
  const scriptsApi = useApi("/api/ai/scripts", { method: "POST", immediate: false });
  const captionsApi = useApi("/api/ai/captions", { method: "POST", immediate: false });

  const projectsApi = useApi("/api/projects", { method: "POST", immediate: false });

  // =============================
  // Current API
  // =============================
  const currentApi = (() => {
    switch (activeTab) {
      case "generator":
        return generateApi;
      case "ideas":
        return ideasApi;
      case "hooks":
        return hooksApi;
      case "scripts":
        return scriptsApi;
      case "captions":
        return captionsApi;
      default:
        return null;
    }
  })();

  const loading = currentApi?.loading || false;

  // =============================
  // Generate handler
  // =============================
  const handleGenerate = async () => {
    let body = {};

    if (activeTab === "generator") {
      if (!generatorForm.topic || !generatorForm.niche || !generatorForm.platform) {
        toast.error("Please fill all fields");
        return;
      }

      body = {
        topic: generatorForm.topic,
        niche: generatorForm.niche,
        platform: generatorForm.platform,
      };

      setCurrentEndpoint("generator");
      await generateApi.callApi({ body });
      return;
    }

    if (activeTab === "ideas") {
      if (!ideasForm.prompt || !ideasForm.niche) {
        toast.error("Please fill prompt and niche");
        return;
      }

      body = {
        prompt: ideasForm.prompt,
        niche: ideasForm.niche,
        count: Number(ideasForm.count) || 5,
      };

      setCurrentEndpoint("ideas");
      await ideasApi.callApi({ body });
      return;
    }

    if (activeTab === "hooks") {
      if (!hooksForm.topic) {
        toast.error("Please fill topic");
        return;
      }

      body = {
        topic: hooksForm.topic,
        count: Number(hooksForm.count) || 5,
      };

      setCurrentEndpoint("hooks");
      await hooksApi.callApi({ body });
      return;
    }

    if (activeTab === "scripts") {
      if (!scriptsForm.topic) {
        toast.error("Please fill topic");
        return;
      }

      body = {
        topic: scriptsForm.topic,
        length: scriptsForm.length,
      };

      setCurrentEndpoint("scripts");
      await scriptsApi.callApi({ body });
      return;
    }

    if (activeTab === "captions") {
      if (!captionsForm.topic) {
        toast.error("Please fill topic");
        return;
      }

      body = {
        topic: captionsForm.topic,
        tone: captionsForm.tone,
        count: Number(captionsForm.count) || 3,
      };

      setCurrentEndpoint("captions");
      await captionsApi.callApi({ body });
      return;
    }
  };

  // =============================
  // Results handler
  // =============================
  useEffect(() => {
    if (!currentApi) return;

    if (currentApi.data?.success && currentApi.data.data) {
      if (activeTab === "generator") {
        setGeneratorResult(currentApi.data.data.result);
        toast.success("Generated successfully!");
        historyApi.callApi(); // refresh history
        return;
      }

      const raw = currentApi.data.data;
      const formatted = Array.isArray(raw) ? raw : [raw];

      setResults(formatted);
      toast.success("Generated successfully!");
      return;
    }

    if (currentApi.error) {
      toast.error(currentApi.error || "Failed to generate");
      setResults([]);
      return;
    }

    if (currentApi.data && currentApi.data.success === false) {
      toast.error(currentApi.data.message || "Request failed");
      setResults([]);
    }
  }, [currentApi?.data, currentApi?.error]);

  // =============================
  // Save to planner
  // =============================
  const saveToPlanner = async (item) => {
    if (!currentEndpoint) return;

    let projectData = { status: "Idea" };

    if (currentEndpoint === "ideas" || currentEndpoint === "hooks") {
      projectData.title = String(item).slice(0, 60);
      projectData.script = item;
    }

    if (currentEndpoint === "scripts") {
      projectData.title = "AI Script";
      projectData.script = item;
    }

    if (currentEndpoint === "captions") {
      projectData.title = "AI Captions";
      projectData.captions = [item];
    }

    await projectsApi.callApi({ body: projectData });

    if (projectsApi.data?.success) toast.success("Saved to Planner!");
    else toast.error(projectsApi.data?.message || "Save failed");
  };

  // =============================
  // Copy
  // =============================
  const copyToClipboard = async (item) => {
    try {
      await navigator.clipboard.writeText(String(item));
      toast.success("Copied!");
    } catch {
      toast.error("Clipboard blocked");
    }
  };

  // =============================
  // Form UI per tab
  // =============================
  const renderTabForm = () => {
    if (activeTab === "generator") {
      return (
        <div className="card p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-gray-900 font-bold text-lg">Full Content Generator</p>
              <p className="text-sm text-gray-500 mt-1">Generate complete viral content packages.</p>
            </div>
            <span className="badge badge-emerald">Generator</span>
          </div>
          <div className="divider my-6" />
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Video Topic</label>
              <input className="input mt-2" placeholder="Example: 5 Tools for React Developers" value={generatorForm.topic} onChange={e => setGeneratorForm(p => ({...p, topic: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Niche</label>
                <select className="input mt-2" value={generatorForm.niche} onChange={e => setGeneratorForm(p => ({...p, niche: e.target.value}))}>
                  <option value="Tech">Tech</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Food">Food</option>
                  <option value="Finance">Finance</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Platform</label>
                <select className="input mt-2" value={generatorForm.platform} onChange={e => setGeneratorForm(p => ({...p, platform: e.target.value}))}>
                  <option value="YouTube">YouTube</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* History Section */}
          {historyApi.data?.data?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Recent Generations</h3>
              <div className="space-y-2">
                {historyApi.data.data.map(item => (
                  <button key={item._id} onClick={() => setGeneratorResult(item.result)} className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-slate-800 border border-gray-100 transition">
                    <p className="text-sm text-gray-900 font-medium truncate">{item.topic}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-gray-500">{item.platform}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "ideas") {
      return (
        <div className="card p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-gray-900 font-bold text-lg">Idea Generator</p>
              <p className="text-sm text-gray-500 mt-1">
                Generate viral short-form content ideas for your niche.
              </p>
            </div>
            <span className="badge badge-indigo">Ideas</span>
          </div>

          <div className="divider my-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="text-sm text-gray-600">Prompt</label>
              <textarea
                className="textarea mt-2"
                placeholder="Example: Give me content ideas for Indian college fitness creators..."
                value={ideasForm.prompt}
                onChange={(e) =>
                  setIdeasForm((p) => ({ ...p, prompt: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Niche</label>
              <input
                className="input mt-2"
                placeholder="fitness / fashion / photography"
                value={ideasForm.niche}
                onChange={(e) =>
                  setIdeasForm((p) => ({ ...p, niche: e.target.value }))
                }
              />

              <label className="text-sm text-gray-600 block mt-4">Count</label>
              <input
                className="input mt-2"
                type="number"
                min={1}
                max={30}
                value={ideasForm.count}
                onChange={(e) =>
                  setIdeasForm((p) => ({ ...p, count: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "hooks") {
      return (
        <div className="card p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-gray-900 font-bold text-lg">Hook Generator</p>
              <p className="text-sm text-gray-500 mt-1">
                Create viral hooks that make people stop scrolling.
              </p>
            </div>
            <span className="badge badge-violet">Hooks</span>
          </div>

          <div className="divider my-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="text-sm text-gray-600">Topic</label>
              <input
                className="input mt-2"
                placeholder="Example: How I stopped procrastinating"
                value={hooksForm.topic}
                onChange={(e) =>
                  setHooksForm((p) => ({ ...p, topic: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Count</label>
              <input
                className="input mt-2"
                type="number"
                min={1}
                max={30}
                value={hooksForm.count}
                onChange={(e) =>
                  setHooksForm((p) => ({ ...p, count: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "scripts") {
      return (
        <div className="card p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-gray-900 font-bold text-lg">Script Writer</p>
              <p className="text-sm text-gray-500 mt-1">
                Generate ready-to-shoot scripts with hook + value + CTA.
              </p>
            </div>
            <span className="badge badge-indigo">Scripts</span>
          </div>

          <div className="divider my-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="text-sm text-gray-600">Topic</label>
              <input
                className="input mt-2"
                placeholder="Example: Build discipline as a student"
                value={scriptsForm.topic}
                onChange={(e) =>
                  setScriptsForm((p) => ({ ...p, topic: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Length</label>
              <select
                className="input mt-2"
                value={scriptsForm.length}
                onChange={(e) =>
                  setScriptsForm((p) => ({ ...p, length: e.target.value }))
                }
              >
                <option value="short">short</option>
                <option value="medium">medium</option>
                <option value="long">long</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    // captions
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-gray-900 font-bold text-lg">Caption Generator</p>
            <p className="text-sm text-gray-500 mt-1">
              Generate clean captions for reels, edits, and posts.
            </p>
          </div>
          <span className="badge badge-violet">Captions</span>
        </div>

        <div className="divider my-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="text-sm text-gray-600">Topic</label>
            <input
              className="input mt-2"
              placeholder="Example: Cinematic travel edit"
              value={captionsForm.topic}
              onChange={(e) =>
                setCaptionsForm((p) => ({ ...p, topic: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Tone</label>
            <select
              className="input mt-2"
              value={captionsForm.tone}
              onChange={(e) =>
                setCaptionsForm((p) => ({ ...p, tone: e.target.value }))
              }
            >
              <option value="motivational">motivational</option>
              <option value="aesthetic">aesthetic</option>
              <option value="professional">professional</option>
              <option value="funny">funny</option>
            </select>

            <label className="text-sm text-gray-600 block mt-4">Count</label>
            <input
              className="input mt-2"
              type="number"
              min={1}
              max={20}
              value={captionsForm.count}
              onChange={(e) =>
                setCaptionsForm((p) => ({ ...p, count: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageShell
        title="AI Tools"
        subtitle="Generate ideas, hooks, scripts and captions in a premium SaaS workflow."
        right={
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                setResults([]);
                setGeneratorResult(null);
                toast.success("Cleared results");
              }}
            >
              Clear
            </button>
            <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["generator", "ideas", "hooks", "scripts", "captions"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setResults([]);
              setCurrentEndpoint(null);
            }}
            className={`px-4 py-2 rounded-xl capitalize border transition ${
              activeTab === tab
                ? "bg-indigo-600/20 text-gray-900 border-indigo-500/30"
                : "bg-gray-50 text-gray-500 border-gray-100 hover:text-gray-900 hover:bg-slate-800/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: form */}
        <div className="space-y-6">{renderTabForm()}</div>

        {/* Right: output */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Generated Output</h2>
              <p className="text-sm text-gray-500 mt-1">
                Your results will appear here. Copy or save them to Planner.
              </p>
            </div>

            <span className="badge badge-indigo">
              {results.length} items
            </span>
          </div>

          <div className="divider my-6" />

          {/* Empty state */}
          {results.length === 0 && !generatorResult && !loading && (
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <p className="text-gray-900 font-semibold">No results yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Fill the form on the left and click{" "}
                <span className="text-indigo-300 font-semibold">Generate</span>.
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-white border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Results Generator */}
          {!loading && activeTab === "generator" && generatorResult && (
            <div className="space-y-4">
              {/* Titles */}
              <div className="rounded-2xl bg-white border border-gray-100 p-4">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="font-semibold text-gray-900">Titles (5 Variations)</h3>
                   <button className="btn-secondary text-xs py-1" onClick={() => copyToClipboard(generatorResult.title.join('\n'))}>Copy</button>
                 </div>
                 <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                   {generatorResult.title?.map((t, i) => <li key={i}>{t}</li>)}
                 </ul>
              </div>
              {/* Hook */}
              <div className="rounded-2xl bg-white border border-gray-100 p-4">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="font-semibold text-gray-900">Hooks (3 Variations)</h3>
                   <button className="btn-secondary text-xs py-1" onClick={() => copyToClipboard(generatorResult.hook.join('\n'))}>Copy</button>
                 </div>
                 <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                   {generatorResult.hook?.map((h, i) => <li key={i}>{h}</li>)}
                 </ul>
              </div>
              {/* Script Outline */}
              <div className="rounded-2xl bg-white border border-gray-100 p-4">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="font-semibold text-gray-900">Script Outline</h3>
                   <button className="btn-secondary text-xs py-1" onClick={() => copyToClipboard(generatorResult.scriptOutline.map(s => s.heading + ':\n' + s.description).join('\n\n'))}>Copy</button>
                 </div>
                 <div className="space-y-3">
                   {generatorResult.scriptOutline?.map((s, i) => (
                     <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <p className="font-medium text-sm text-gray-900">{s.heading}</p>
                       <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{s.description}</p>
                     </div>
                   ))}
                 </div>
              </div>
              {/* Captions */}
              <div className="rounded-2xl bg-white border border-gray-100 p-4">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="font-semibold text-gray-900">Captions (3 Variations)</h3>
                   <button className="btn-secondary text-xs py-1" onClick={() => copyToClipboard(generatorResult.captions.join('\n\n'))}>Copy</button>
                 </div>
                 <div className="space-y-3">
                   {generatorResult.captions?.map((c, i) => (
                     <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                       {c}
                     </div>
                   ))}
                 </div>
              </div>
              {/* Hashtags */}
              <div className="rounded-2xl bg-white border border-gray-100 p-4">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="font-semibold text-gray-900">Hashtags</h3>
                   <button className="btn-secondary text-xs py-1" onClick={() => copyToClipboard(generatorResult.hashtags.join(' '))}>Copy</button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {generatorResult.hashtags?.map((tag, i) => (
                     <span key={i} className="px-2 py-1 bg-white text-indigo-300 text-xs rounded-md border border-gray-100">
                       {tag.startsWith('#') ? tag : `#${tag}`}
                     </span>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {/* Results Old */}
          {!loading && activeTab !== "generator" && results.length > 0 && (
            <div className="space-y-4">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-gray-100 p-4"
                >
                  <pre className="whitespace-pre-wrap text-gray-700 text-sm">
                    {String(item)}
                  </pre>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      className="btn-secondary"
                      onClick={() => copyToClipboard(item)}
                    >
                      Copy
                    </button>

                    <button
                      className="btn-primary"
                      onClick={() => saveToPlanner(item)}
                    >
                      Save to Planner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITools;