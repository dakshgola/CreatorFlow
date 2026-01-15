import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useApi from "../hooks/useApi";

const AITools = () => {
  // =============================
  // Prefill from History
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
  const [activeTab, setActiveTab] = useState(prefillData?.tab || "ideas");
  const [results, setResults] = useState([]);
  const [currentEndpoint, setCurrentEndpoint] = useState(null);

  // =============================
  // Forms
  // =============================
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

  const [hashtagsForm, setHashtagsForm] = useState(
    prefillData?.tab === "hashtags" && prefillData.formData
      ? prefillData.formData
      : { niche: "", count: 15 }
  );

  // =============================
  // APIs
  // =============================
  const ideasApi = useApi("/ai/ideas", { method: "POST", immediate: false });
  const hooksApi = useApi("/ai/hooks", { method: "POST", immediate: false });
  const scriptsApi = useApi("/ai/scripts", { method: "POST", immediate: false });
  const captionsApi = useApi("/ai/captions", { method: "POST", immediate: false });
  const hashtagsApi = useApi("/ai/hashtags", { method: "POST", immediate: false });
  const projectsApi = useApi("/projects", { method: "POST", immediate: false });

  // =============================
  // Current API (stable)
  // =============================
  const currentApi = (() => {
    switch (activeTab) {
      case "ideas":
        return ideasApi;
      case "hooks":
        return hooksApi;
      case "scripts":
        return scriptsApi;
      case "captions":
        return captionsApi;
      case "hashtags":
        return hashtagsApi;
      default:
        return null;
    }
  })();

  const loading = currentApi?.loading || false;

  // =============================
  // Generate
  // =============================
  const handleGenerate = async () => {
    let body = {};

    switch (activeTab) {
      case "ideas":
        if (!ideasForm.prompt || !ideasForm.niche) {
          toast.error("Please fill in prompt and niche");
          return;
        }
        body = {
          prompt: ideasForm.prompt,
          niche: ideasForm.niche,
          count: Number(ideasForm.count) || 5,
        };
        setCurrentEndpoint("ideas");
        await ideasApi.callApi({ body });
        break;

      case "hooks":
        if (!hooksForm.topic) {
          toast.error("Please fill in topic");
          return;
        }
        body = {
          topic: hooksForm.topic,
          count: Number(hooksForm.count) || 5,
        };
        setCurrentEndpoint("hooks");
        await hooksApi.callApi({ body });
        break;

      case "scripts":
        if (!scriptsForm.topic) {
          toast.error("Please fill in topic");
          return;
        }
        body = {
          topic: scriptsForm.topic,
          length: scriptsForm.length,
        };
        setCurrentEndpoint("scripts");
        await scriptsApi.callApi({ body });
        break;

      case "captions":
        if (!captionsForm.topic) {
          toast.error("Please fill in topic");
          return;
        }
        body = {
          topic: captionsForm.topic,
          tone: captionsForm.tone,
          count: Number(captionsForm.count) || 3,
        };
        setCurrentEndpoint("captions");
        await captionsApi.callApi({ body });
        break;

      case "hashtags":
        if (!hashtagsForm.niche) {
          toast.error("Please fill in niche");
          return;
        }
        body = {
          niche: hashtagsForm.niche,
          count: Number(hashtagsForm.count) || 15,
        };
        setCurrentEndpoint("hashtags");
        await hashtagsApi.callApi({ body });
        break;

      default:
        break;
    }
  };

  // =============================
  // Prefill Toast
  // =============================
  useEffect(() => {
    if (prefillData) toast.success("Form prefilled from history!");
    // eslint-disable-next-line
  }, []);

  // =============================
  // Results Handler (FIXED)
  // =============================
   useEffect(() => {
  if (!currentApi) return;

  if (currentApi.data?.success) {
    const raw = currentApi.data.data;

    if (currentEndpoint === "hashtags") {
      let tags = [];

      if (Array.isArray(raw)) {
        tags = raw;
      } else if (raw?.hashtags && Array.isArray(raw.hashtags)) {
        tags = raw.hashtags;
      } else if (typeof raw === "string") {
        tags = raw
          .split(/[,#\n]/)
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (raw && typeof raw === "object") {
        const firstArray = Object.values(raw).find((v) => Array.isArray(v));
        if (Array.isArray(firstArray)) tags = firstArray;
      }

      tags = tags
        .map((t) => String(t).trim().replace(/^#/, ""))
        .filter(Boolean);

      if (tags.length === 0) {
        toast.error("No hashtags generated. Please try again.");
        setResults([]);
        return;
      }

      setResults([tags]);
      toast.success("Hashtags generated!");
      return;
    }

    const formatted = Array.isArray(raw) ? raw : [raw];
    setResults(formatted);
    toast.success("AI generated successfully!");
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
}, [currentApi?.data, currentApi?.error, currentEndpoint]);


  // =============================
  // Save to Planner
  // =============================
  const saveToPlanner = async (item) => {
    let projectData = { status: "Idea" };

    switch (currentEndpoint) {
      case "ideas":
      case "hooks":
        projectData.title = String(item).slice(0, 50);
        projectData.script = item;
        break;

      case "scripts":
        projectData.title = "AI Script";
        projectData.script = item;
        break;

      case "captions":
        projectData.title = "AI Caption";
        projectData.captions = [item];
        break;

      case "hashtags":
        projectData.title = "AI Hashtags";
        projectData.hashtags = Array.isArray(item) ? item : [item];
        break;

      default:
        return;
    }

    await projectsApi.callApi({ body: projectData });

    if (projectsApi.data?.success) {
      toast.success("Saved to Planner!");
    } else {
      toast.error(projectsApi.data?.message || "Save failed");
    }
  };

  // =============================
  // Copy
  // =============================
  const copyToClipboard = async (item) => {
    try {
      const text =
        currentEndpoint === "hashtags"
          ? (Array.isArray(item) ? item : [item]).map((t) => `#${t}`).join(" ")
          : String(item);

      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Clipboard blocked");
    }
  };

  // =============================
  // Render Result
  // =============================
  const formatResult = (item) => {
    if (currentEndpoint === "hashtags") {
      return (
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(item) ? item : [item]).map((tag, i) => (
            <span
              key={i}
              className="bg-indigo-600/20 border border-indigo-500/30 px-4 py-1.5 rounded-full text-sm text-white"
            >
              #{tag}
            </span>
          ))}
        </div>
      );
    }

    return <pre className="text-slate-300 whitespace-pre-wrap">{String(item)}</pre>;
  };

  // =============================
  // UI: Forms (✅ MAIN FIX)
  // =============================
  const renderForm = () => {
    if (activeTab === "ideas") {
      return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Prompt</label>
              <textarea
                value={ideasForm.prompt}
                onChange={(e) => setIdeasForm({ ...ideasForm, prompt: e.target.value })}
                className="mt-2 w-full min-h-[110px] bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
                placeholder="What do you want ideas for?"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Niche</label>
              <input
                value={ideasForm.niche}
                onChange={(e) => setIdeasForm({ ...ideasForm, niche: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
                placeholder="fitness / tech / fashion..."
              />

              <label className="text-sm text-slate-300 block mt-4">Count</label>
              <input
                type="number"
                value={ideasForm.count}
                onChange={(e) => setIdeasForm({ ...ideasForm, count: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
                min={1}
                max={50}
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "hooks") {
      return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Topic</label>
              <input
                value={hooksForm.topic}
                onChange={(e) => setHooksForm({ ...hooksForm, topic: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
                placeholder="Eg: How I built discipline in 7 days"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Count</label>
              <input
                type="number"
                value={hooksForm.count}
                onChange={(e) => setHooksForm({ ...hooksForm, count: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
                min={1}
                max={50}
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "scripts") {
      return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Topic</label>
              <input
                value={scriptsForm.topic}
                onChange={(e) => setScriptsForm({ ...scriptsForm, topic: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
                placeholder="Eg: Productivity + college life"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Length</label>
              <select
                value={scriptsForm.length}
                onChange={(e) => setScriptsForm({ ...scriptsForm, length: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
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

    if (activeTab === "captions") {
      return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Topic</label>
              <input
                value={captionsForm.topic}
                onChange={(e) => setCaptionsForm({ ...captionsForm, topic: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
                placeholder="Eg: Cinematic edit / fitness / travel"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Tone</label>
              <select
                value={captionsForm.tone}
                onChange={(e) => setCaptionsForm({ ...captionsForm, tone: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
              >
                <option value="motivational">motivational</option>
                <option value="funny">funny</option>
                <option value="aesthetic">aesthetic</option>
                <option value="professional">professional</option>
              </select>

              <label className="text-sm text-slate-300 block mt-4">Count</label>
              <input
                type="number"
                value={captionsForm.count}
                onChange={(e) => setCaptionsForm({ ...captionsForm, count: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
                min={1}
                max={20}
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "hashtags") {
      return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Niche</label>
              <input
                value={hashtagsForm.niche}
                onChange={(e) => setHashtagsForm({ ...hashtagsForm, niche: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
                placeholder="Eg: fitness, coding, photography..."
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Count</label>
              <input
                type="number"
                value={hashtagsForm.count}
                onChange={(e) => setHashtagsForm({ ...hashtagsForm, count: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none"
                min={1}
                max={50}
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-950 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">AI Tools</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["ideas", "hooks", "scripts", "captions", "hashtags"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setResults([]);
              setCurrentEndpoint(null);
            }}
            className={`px-4 py-2 rounded-lg capitalize ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ✅ Input Form Area */}
      {renderForm()}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`px-6 py-3 rounded-lg text-white mb-6 ${
          loading ? "bg-indigo-600/60" : "bg-indigo-600 hover:bg-indigo-500"
        }`}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {/* Results */}
      <div className="space-y-4">
        {results.map((item, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            {formatResult(item)}

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => copyToClipboard(item)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
              >
                Copy
              </button>

              <button
                onClick={() => saveToPlanner(item)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AITools;
