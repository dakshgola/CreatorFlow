import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  url: {
    type: String,
    required: [true, 'Media URL is required'],
    trim: true,
  },
  publicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required'],
    trim: true,
    unique: true,
  },
  filename: {
    type: String,
    trim: true,
  },
  mimeType: {
    type: String,
    trim: true,
  },
  size: {
    type: Number, // Size in bytes
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  format: {
    type: String, // e.g., 'jpg', 'png', 'gif'
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
mediaSchema.index({ userId: 1, createdAt: -1 });
mediaSchema.index({ publicId: 1 });

const Media = mongoose.model('Media', mediaSchema);

export default Media;
