import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client ID is required'],
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative'],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Amount must be greater than 0',
    },
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(date) {
        return date instanceof Date;
      },
      message: 'Due date must be a valid date',
    },
  },
  paid: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
paymentSchema.index({ userId: 1, paid: 1 });
paymentSchema.index({ userId: 1, clientId: 1 });
paymentSchema.index({ dueDate: 1 });

// Virtual for overdue payments
paymentSchema.virtual('isOverdue').get(function() {
  return !this.paid && this.dueDate < new Date();
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
