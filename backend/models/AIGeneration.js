import mongoose from 'mongoose';

const aiGenerationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: String,
  niche: String,
  platform: String,
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AIGeneration = mongoose.model('AIGeneration', aiGenerationSchema);

export default AIGeneration;
