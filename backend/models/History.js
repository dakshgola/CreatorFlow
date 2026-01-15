import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  type: {
    type: String,
    required: [true, 'History type is required'],
    enum: {
      values: ['client', 'project', 'task', 'payment', 'system', 'other'],
      message: 'Type must be one of: client, project, task, payment, system, other',
    },
    index: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  // Optional metadata for additional context
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
historySchema.index({ userId: 1, type: 1, createdAt: -1 });
historySchema.index({ userId: 1, createdAt: -1 });

// Compound index for common query patterns
historySchema.index({ userId: 1, type: 1 });

const History = mongoose.model('History', historySchema);

export default History;
