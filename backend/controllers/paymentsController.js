import Payment from '../models/Payment.js';
import AppError from '../utils/AppError.js';

/**
 * Get all payments for the authenticated user
 * GET /api/v1/payments
 */
export const listPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('clientId', 'name niche paymentRate')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new payment record
 * POST /api/v1/payments
 */
export const createPayment = async (req, res, next) => {
  try {
    const { clientId, amount, dueDate, paid } = req.body;

    if (!clientId || !amount || !dueDate) {
      return next(new AppError('Please provide clientId, amount, and dueDate', 400));
    }

    const payment = await Payment.create({
      userId: req.user.id,
      clientId,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      paid: paid || false,
    });

    // Populate client details before returning
    const populated = await payment.populate('clientId', 'name niche paymentRate');

    res.status(201).json({
      success: true,
      message: 'Payment record created successfully',
      data: populated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join(', '), 400));
    }
    next(error);
  }
};

/**
 * Update a payment record
 * PUT /api/v1/payments/:id
 */
export const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { clientId, amount, dueDate, paid } = req.body;

    let payment = await Payment.findOne({ _id: id, userId: req.user.id });

    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }

    if (clientId !== undefined) payment.clientId = clientId;
    if (amount !== undefined) payment.amount = Number(amount);
    if (dueDate !== undefined) payment.dueDate = new Date(dueDate);
    if (paid !== undefined) payment.paid = paid;

    await payment.save();
    const populated = await payment.populate('clientId', 'name niche paymentRate');

    res.json({
      success: true,
      message: 'Payment record updated successfully',
      data: populated,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid payment ID format', 400));
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join(', '), 400));
    }
    next(error);
  }
};

/**
 * Delete a payment record
 * DELETE /api/v1/payments/:id
 */
export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }

    res.json({
      success: true,
      message: 'Payment record deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid payment ID format', 400));
    }
    next(error);
  }
};
