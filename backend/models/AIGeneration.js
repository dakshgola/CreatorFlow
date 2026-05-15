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
    enum: ['script', 'hook', 'caption', 'ideas', 'other'],
    default: 'other'
  },
  platform: String,
  output: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

aiGenerationSchema.index({ userId: 1 });
aiGenerationSchema.index({ createdAt: -1 });

const AIGeneration = mongoose.model('AIGeneration', aiGenerationSchema);

export default AIGeneration;
