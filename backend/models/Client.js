import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true, // Index for faster queries
  },
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    minlength: [2, 'Client name must be at least 2 characters'],
    maxlength: [100, 'Client name cannot exceed 100 characters'],
  },
  niche: {
    type: String,
    required: [true, 'Niche is required'],
    trim: true,
    maxlength: [50, 'Niche cannot exceed 50 characters'],
  },
  links: {
    type: [{
      platform: {
        type: String,
        trim: true,
      },
      url: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
      },
    }],
    default: [],
    validate: {
      validator: function(links) {
        return links.length <= 10; // Limit to 10 links
      },
      message: 'Cannot have more than 10 links',
    },
  },
  paymentRate: {
    type: Number,
    required: [true, 'Payment rate is required'],
    min: [0, 'Payment rate cannot be negative'],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: '',
  },
}, {
  timestamps: true,
});

// Index for faster queries by userId
clientSchema.index({ userId: 1, name: 1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;
