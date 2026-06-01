import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowRight, Sparkles, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import PageShell from "../components/PageShell";

const STATUSES = ["Idea", "Script", "Shoot", "Edit", "Posted"];
const PLATFORMS = ["Instagram", "YouTube", "LinkedIn", "Twitter", "TikTok"];

// In production, ensure Vite config proxies /api properly, or use full URL in development.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1/planner";

const Planner = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState({
    Idea: [],
    Script: [],
    Shoot: [],
    Edit: [],
    Posted: [],
  });
  const [loading, setLoading] = useState(true);

  // State for the inline "Add Card" forms. Object keyed by column status.
  const [addingInColumn, setAddingInColumn] = useState(null);
  const [newCard, setNewCard] = useState({
    title: "",
    platform: "Instagram",
    dueDate: "",
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setCards(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch cards", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HTML5 DRAG AND DROP HANDLERS
  // ==========================================

  /**
   * 1. onDragStart
   * Fired when the user starts dragging a card.
   * We store the card's ID and its original column in the dataTransfer object.
   */
  const handleDragStart = (e, cardId, sourceColumn) => {
    e.dataTransfer.setData("cardId", cardId);
    e.dataTransfer.setData("sourceColumn", sourceColumn);

    // Optional visual flair: make the dragged card slightly transparent
    setTimeout(() => {
      e.target.style.opacity = "0.5";
    }, 0);
  };

  /**
   * 2. onDragEnd
   * Clean up any visual flair when the drag ends (whether it was dropped or cancelled).
   */
  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  /**
   * 3. onDragOver
   * Must call preventDefault() to allow an element to receive a drop event.
   */
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  /**
   * 4. onDrop
   * Fired when a card is dropped over a column.
   * Reads data from dataTransfer, executes optimistic UI update, then patches the API.
   */
  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    const sourceColumn = e.dataTransfer.getData("sourceColumn");

    // Don't do anything if we drop in the same column or there's no valid ID
    if (!cardId || sourceColumn === targetColumn) return;

    // Find the actual card object in our state
    const cardToMove = cards[sourceColumn].find((c) => c._id === cardId);
    if (!cardToMove) return;

    // Backup state for optimistic rollback
    const originalCards = JSON.parse(JSON.stringify(cards));

    // --- OPTIMISTIC UI UPDATE ---
    setCards((prev) => ({
      ...prev,
      [sourceColumn]: prev[sourceColumn].filter((c) => c._id !== cardId),
      [targetColumn]: [{ ...cardToMove, status: targetColumn }, ...prev[targetColumn]],
    }));

    // --- API CALL (PATCH status) ---
    try {
      const res = await fetch(`${API_URL}/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: targetColumn }),
      });
      
      if (!res.ok) throw new Error("API failed");
    } catch (err) {
      console.error("Failed to update card status", err);
      // Revert optimistic update locally
      setCards(originalCards);
      toast.error("Failed to move card. Position restored.");
    }
  };

  // ==========================================
  // INLINE CARD CREATION (POST)
  // ==========================================
  const handleCreateCard = async (status) => {
    if (!newCard.title.trim()) return;

    // Temporary ID for optimistic rendering
    const tempId = `temp-${Date.now()}`;
    const placeholderCard = {
      _id: tempId,
      ...newCard,
      status,
      aiGenerated: false,
    };

    // --- OPTIMISTIC UI UPDATE ---
    setCards((prev) => ({
      ...prev,
      [status]: [...prev[status], placeholderCard],
    }));

    // Reset form state
    setAddingInColumn(null);
    setNewCard({ title: "", platform: "Instagram", dueDate: "" });

    // --- API CALL (POST) ---
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...newCard, status }),
      });
      const json = await res.json();

      if (json.success) {
        // Swap the temporary card with the real database card (with real _id)
        setCards((prev) => ({
          ...prev,
          [status]: prev[status].map((c) => (c._id === tempId ? json.data : c)),
        }));
      } else {
        throw new Error("Create failed");
      }
    } catch (err) {
      console.error("Failed to create card", err);
      // Revert if API fails
      setCards((prev) => ({
        ...prev,
        [status]: prev[status].filter((c) => c._id !== tempId),
      }));
    }
  };

  // ==========================================
  // OTHER ACTIONS (QUICK MOVE & DELETE)
  // ==========================================
  const handleQuickMove = async (card, sourceColumn) => {
    const currentIndex = STATUSES.indexOf(sourceColumn);
    if (currentIndex >= STATUSES.length - 1) return;

    const targetColumn = STATUSES[currentIndex + 1];

    // Backup state for optimistic rollback
    const originalCards = JSON.parse(JSON.stringify(cards));

    // Optimistic Update
    setCards((prev) => ({
      ...prev,
      [sourceColumn]: prev[sourceColumn].filter((c) => c._id !== card._id),
      [targetColumn]: [{ ...card, status: targetColumn }, ...prev[targetColumn]],
    }));

    try {
      const res = await fetch(`${API_URL}/${card._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: targetColumn }),
      });
      if (!res.ok) throw new Error("API failed");
    } catch (err) {
      console.error("Failed to quick move", err);
      setCards(originalCards);
      toast.error("Failed to move card. Position restored.");
    }
  };

  const handleDelete = async (cardId, sourceColumn) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;

    const cardToDelete = cards[sourceColumn].find((c) => c._id === cardId);

    // Optimistic Delete
    setCards((prev) => ({
      ...prev,
      [sourceColumn]: prev[sourceColumn].filter((c) => c._id !== cardId),
    }));

    try {
      const res = await fetch(`${API_URL}/${cardId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("Failed to delete", err);
      // Revert on failure
      setCards((prev) => ({
        ...prev,
        [sourceColumn]: [...prev[sourceColumn], cardToDelete],
      }));
      toast.error("Failed to delete card.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500 font-semibold animate-pulse">
          Loading Planner Board...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageShell
        title="Content Planner"
        subtitle="Manage your pipeline with drag-and-drop ease."
      />

      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max h-full pb-8">
          {STATUSES.map((col) => (
            <div
              key={col}
              className="w-80 flex flex-col bg-gray-100/50 rounded-xl border border-gray-200 overflow-hidden"
              // DND Receivers
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
            >
              {/* COLUMN HEADER */}
              <div className="p-4 border-b border-gray-200 bg-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800">{col}</h3>
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                    {cards[col]?.length || 0}
                  </span>
                </div>

                {/* "Generate from AI" button ONLY in Idea column */}
                {col === "Idea" && (
                  <button
                    onClick={() => navigate("/ai-tools")}
                    className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded-md font-medium transition-colors"
                  >
                    <Sparkles size={12} /> AI Ideas
                  </button>
                )}
              </div>

              {/* SCROLLABLE CARD LIST */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {cards[col]?.map((card) => (
                  <div
                    key={card._id}
                    // DND Draggable properties
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, card._id, col)}
                    onDragEnd={handleDragEnd}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                        {card.platform}
                      </span>
                      {card.aiGenerated && (
                        <Sparkles size={14} className="text-purple-500" />
                      )}
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-3 leading-snug">
                      {card.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>
                        {card.dueDate
                          ? new Date(card.dueDate).toLocaleDateString()
                          : "No due date"}
                      </span>

                      {/* Hover Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(card._id, col)}
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Delete card"
                        >
                          <Trash2 size={14} />
                        </button>

                        {STATUSES.indexOf(col) < STATUSES.length - 1 && (
                          <button
                            onClick={() => handleQuickMove(card, col)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1 rounded"
                            title="Move to next column"
                          >
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* INLINE ADD CARD FORM */}
                {addingInColumn === col ? (
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-200 animate-in fade-in duration-200">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Card Title..."
                      className="w-full text-sm border border-gray-300 rounded p-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={newCard.title}
                      onChange={(e) =>
                        setNewCard({ ...newCard, title: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateCard(col);
                        if (e.key === "Escape") setAddingInColumn(null);
                      }}
                    />
                    <div className="flex gap-2 mb-2">
                      <select
                        className="text-xs border border-gray-300 rounded p-1 flex-1 focus:outline-none"
                        value={newCard.platform}
                        onChange={(e) =>
                          setNewCard({ ...newCard, platform: e.target.value })
                        }
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        className="text-xs border border-gray-300 rounded p-1 flex-1 focus:outline-none"
                        value={newCard.dueDate}
                        onChange={(e) =>
                          setNewCard({ ...newCard, dueDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-1 mt-3">
                      <button
                        onClick={() => setAddingInColumn(null)}
                        className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded font-medium transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCreateCard(col)}
                        className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium transition shadow-sm"
                      >
                        Add Card
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingInColumn(col)}
                    className="w-full py-2 flex items-center justify-center gap-1 text-sm text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-lg transition-colors border border-dashed border-gray-300"
                  >
                    <Plus size={16} /> Add Card
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Planner;
