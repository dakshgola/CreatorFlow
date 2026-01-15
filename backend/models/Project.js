import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null, // Optional field
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  script: {
    type: String,
    trim: true,
    maxlength: [10000, 'Script cannot exceed 10000 characters'],
    default: '',
  },
  captions: {
    type: [{
      type: String,
      trim: true,
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    }],
    default: [],
    validate: {
      validator: function(captions) {
        return captions.length <= 50; // Limit to 50 captions
      },
      message: 'Cannot have more than 50 captions',
    },
  },
  hashtags: {
    type: [{
      type: String,
      trim: true,
      maxlength: [50, 'Hashtag cannot exceed 50 characters'],
    }],
    default: [],
    validate: {
      validator: function(hashtags) {
        return hashtags.length <= 30; // Limit to 30 hashtags
      },
      message: 'Cannot have more than 30 hashtags',
    },
  },
  status: {
    type: String,
    enum: {
      values: ['Idea', 'Scripted', 'Shot', 'Edited', 'Posted'],
      message: 'Status must be one of: Idea, Scripted, Shot, Edited, Posted',
    },
    default: 'Idea',
    index: true,
  },
  plannedDate: {
    type: Date,
    default: null,
    validate: {
      validator: function(date) {
        // Allow null or valid future/past dates
        return !date || date instanceof Date;
      },
      message: 'Planned date must be a valid date',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, clientId: 1 });
projectSchema.index({ plannedDate: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
