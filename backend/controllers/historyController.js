import ContentHistory from "../models/ContentHistory.js";

export const getHistory = async (req, res) => {
  try {
    const history = await ContentHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSavedHistory = async (req, res) => {
  try {
    const history = await ContentHistory.find({ userId: req.user.id, isSaved: true })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleSaveHistory = async (req, res) => {
  try {
    const item = await ContentHistory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ success: false, message: "History item not found" });
    
    item.isSaved = !item.isSaved;
    await item.save();
    
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const item = await ContentHistory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ success: false, message: "History item not found" });
    
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
