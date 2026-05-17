import React, { useState, useEffect } from "react";
import { Trash2, Bookmark, ChevronDown, ChevronUp, Sparkles, MessageSquare, Target } from "lucide-react";
import PageShell from "../components/PageShell";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1/history";

// Custom helper for relative timestamps (no external libraries)
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setHistory(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const toggleSave = async (id, currentSavedState) => {
    // Optimistic UI Update
    setHistory((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, isSaved: !currentSavedState } : item
      )
    );

    try {
      await fetch(`${API_URL}/${id}/save`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch (err) {
      // Revert if API fails
      setHistory((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isSaved: currentSavedState } : item
        )
      );
    }
  };

  const deleteItem = async (id) => {
    const itemToDelete = history.find((i) => i._id === id);
    if (!window.confirm("Are you sure you want to delete this history item?")) return;

    // Optimistic Delete
    setHistory((prev) => prev.filter((item) => item._id !== id));

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      // Revert if API fails
      setHistory((prev) =>
        [...prev, itemToDelete].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    }
  };

  // --- FILTERING ---

  const filteredHistory = history.filter((item) => {
    if (filter === "All") return true;
    if (filter === "Saved") return item.isSaved;
    // Maps "Ideas" -> "idea", "Captions" -> "caption", "Scores" -> "score"
    return item.type.toLowerCase() === filter.toLowerCase().slice(0, -1);
  });

  // --- RENDERING HELPERS ---

  const renderPreview = (item) => {
    if (item.type === "idea" || item.type === "caption") {
      const text = item.output?.text || "No content found.";
      return text.length > 100 ? text.substring(0, 100) + "..." : text;
    }
    if (item.type === "score") {
      return `Overall Score: ${item.output?.overallScore || 0}/10`;
    }
    return "No preview available.";
  };

  const renderExpanded = (item) => {
    if (item.type === "idea" || item.type === "caption") {
      return (
        <div className="whitespace-pre-wrap text-gray-700 text-sm mt-3 bg-gray-50 border border-gray-100 p-4 rounded-lg shadow-inner">
          {item.output?.text || "No content found."}
        </div>
      );
    }
    if (item.type === "score") {
      return (
        <div className="mt-3 bg-gray-50 border border-gray-100 p-4 rounded-lg shadow-inner grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-800">
          <div><span className="font-semibold text-gray-900">Hook Strength:</span> {item.output?.hookStrength}/10</div>
          <div><span className="font-semibold text-gray-900">Clarity:</span> {item.output?.clarity}/10</div>
          <div><span className="font-semibold text-gray-900">Retention:</span> {item.output?.retentionPotential}/10</div>
          <div><span className="font-semibold text-gray-900">Overall Score:</span> {item.output?.overallScore}/10</div>
          <div className="col-span-2 mt-1">
            <span className="font-semibold text-gray-900 block mb-1">Reason:</span> 
            <p className="text-gray-600">{item.output?.reason}</p>
          </div>
          <div className="col-span-2 mt-1 p-3 bg-indigo-50/50 rounded border border-indigo-100 text-indigo-900">
            <span className="font-semibold block mb-1">Fix Suggestion:</span> 
            <p>{item.output?.fixSuggestion}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case "idea": return "bg-purple-100 text-purple-700 border-purple-200";
      case "caption": return "bg-blue-100 text-blue-700 border-blue-200";
      case "score": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "idea": return <Sparkles size={14} className="mr-1.5" />;
      case "caption": return <MessageSquare size={14} className="mr-1.5" />;
      case "score": return <Target size={14} className="mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageShell
        title="AI History"
        subtitle="Review, bookmark, and manage your past AI-generated content."
      />

      <div className="max-w-4xl mx-auto w-full px-6 py-8 flex-1">
        {/* TABS */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Ideas", "Captions", "Scores", "Saved"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setFilter(tab);
                setExpandedId(null); // collapse all when switching tabs
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
                filter === tab
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm animate-pulse flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded-md w-24"></div>
                  <div className="h-6 bg-gray-200 rounded-md w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
              <Sparkles className="text-indigo-500" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No history found</h3>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
              {filter === "All"
                ? "You haven't generated any AI content yet. Head over to the AI Tools to get started."
                : `No ${filter.toLowerCase()} found in your history.`}
            </p>
          </div>
        ) : (
          /* HISTORY LIST */
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 transition-shadow hover:shadow-md"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getBadgeStyle(item.type)} uppercase tracking-wider`}
                    >
                      {getIcon(item.type)}
                      {item.type}
                    </span>
                    <span className="text-sm font-medium text-gray-400">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSave(item._id, item.isSaved)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.isSaved
                          ? "text-yellow-500 bg-yellow-50"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                      title={item.isSaved ? "Unsave" : "Save"}
                    >
                      <Bookmark size={18} fill={item.isSaved ? "currentColor" : "none"} strokeWidth={item.isSaved ? 1 : 2} />
                    </button>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="mt-4">
                  <p className="text-gray-800 leading-relaxed font-medium">
                    {renderPreview(item)}
                  </p>
                </div>

                {/* Expanded Content */}
                {expandedId === item._id && renderExpanded(item)}

                {/* Expand Toggle Button */}
                <button
                  onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                  className="mt-4 text-sm text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-800 transition-colors"
                >
                  {expandedId === item._id ? (
                    <>
                      <ChevronUp size={16} /> Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} /> View full output
                    </>
                  )}
                </button>
              </div>
            ))}

            {/* Pagination Button */}
            <div className="pt-6 pb-12 text-center">
              <button
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
                onClick={() =>
                  alert("Backend currently limits to 20 recent items. Pagination support coming soon!")
                }
              >
                Load more history
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
