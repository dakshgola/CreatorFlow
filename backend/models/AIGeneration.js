import mongoose from 'mongoose';

const aiGenerationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: String,
  type: {
    type: String,
    enum: ['content_idea', 'caption', 'performance_score', 'chat', 'script', 'hook', 'ideas', 'other'],
    default: 'other'
  },
  platform: String,
  prompt: {
    type: String,
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
  },
  bookmarked: {
    type: Boolean,
    default: false,
  },
  conversationHistory: [
    {
      role: {
        type: String,
        enum: ['user', 'model'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

aiGenerationSchema.index({ userId: 1 });
aiGenerationSchema.index({ createdAt: -1 });

const AIGeneration = mongoose.model('AIGeneration', aiGenerationSchema);

export default AIGeneration;
