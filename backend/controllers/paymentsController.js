import Payment from '../models/Payment.js';

/**
 * Get all payments for the authenticated user
 * GET /api/v1/payments
 */
export const listPayments = async (req, res) => {
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
    console.error('List payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments',
    });
  }
};

/**
 * Create a new payment record
 * POST /api/v1/payments
 */
export const createPayment = async (req, res) => {
  try {
    const { clientId, amount, dueDate, paid } = req.body;

    if (!clientId || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide clientId, amount, and dueDate',
      });
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
    console.error('Create payment error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment record',
    });
  }
};

/**
 * Update a payment record
 * PUT /api/v1/payments/:id
 */
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId, amount, dueDate, paid } = req.body;

    let payment = await Payment.findOne({ _id: id, userId: req.user.id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
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
    console.error('Update payment error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID format',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating payment record',
    });
  }
};

/**
 * Delete a payment record
 * DELETE /api/v1/payments/:id
 */
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    res.json({
      success: true,
      message: 'Payment record deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting payment record',
    });
  }
};
