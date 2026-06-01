import Client from '../models/Client.js';
import AppError from '../utils/AppError.js';

/**
 * Get all clients for the authenticated user
 * GET /api/clients
 */
export const listClients = async (req, res, next) => {
  try {
    // Get clients belonging to the authenticated user
    const clients = await Client.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single client by ID
 * GET /api/clients/:id
 */
export const getClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      userId: req.user.id, // Ensure client belongs to the user
    });

    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return next(new AppError('Invalid client ID format', 400));
    }
    next(error);
  }
};

/**
 * Create a new client
 * POST /api/clients
 */
export const createClient = async (req, res, next) => {
  try {
    const { name, niche, links, paymentRate, notes } = req.body;

    // Validate required fields
    if (!name || !niche || paymentRate === undefined) {
      return next(new AppError('Please provide name, niche, and paymentRate', 400));
    }

    // Validate paymentRate is a number and positive
    if (typeof paymentRate !== 'number' || paymentRate < 0) {
      return next(new AppError('Payment rate must be a positive number', 400));
    }

    // Validate links array if provided
    if (links && Array.isArray(links)) {
      for (const link of links) {
        if (link.url && !/^https?:\/\/.+/.test(link.url)) {
          return next(new AppError('All links must have valid URLs', 400));
        }
      }
    }

    // Create client
    const client = await Client.create({
      userId: req.user.id,
      name: name.trim(),
      niche: niche.trim(),
      links: links || [],
      paymentRate,
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join(', '), 400));
    }
    next(error);
  }
};

/**
 * Update a client
 * PUT /api/clients/:id
 */
export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, niche, links, paymentRate, notes } = req.body;

    // Find client and ensure it belongs to the user
    let client = await Client.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    // Validate paymentRate if provided
    if (paymentRate !== undefined) {
      if (typeof paymentRate !== 'number' || paymentRate < 0) {
        return next(new AppError('Payment rate must be a positive number', 400));
      }
    }

    // Validate links array if provided
    if (links && Array.isArray(links)) {
      for (const link of links) {
        if (link.url && !/^https?:\/\/.+/.test(link.url)) {
          return next(new AppError('All links must have valid URLs', 400));
        }
      }
    }

    // Update fields
    if (name !== undefined) client.name = name.trim();
    if (niche !== undefined) client.niche = niche.trim();
    if (links !== undefined) client.links = links;
    if (paymentRate !== undefined) client.paymentRate = paymentRate;
    if (notes !== undefined) client.notes = notes.trim();

    // Save updated client
    await client.save();

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client,
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return next(new AppError('Invalid client ID format', 400));
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join(', '), 400));
    }
    next(error);
  }
};

/**
 * Delete a client
 * DELETE /api/clients/:id
 */
export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find and delete client (ensure it belongs to the user)
    const client = await Client.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    res.json({
      success: true,
      message: 'Client deleted successfully',
      data: {},
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return next(new AppError('Invalid client ID format', 400));
    }
    next(error);
  }
};
