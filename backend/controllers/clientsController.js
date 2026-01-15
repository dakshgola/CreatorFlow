import Client from '../models/Client.js';

/**
 * Get all clients for the authenticated user
 * GET /api/clients
 */
export const listClients = async (req, res) => {
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
    console.error('List clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching clients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get a single client by ID
 * GET /api/clients/:id
 */
export const getClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      userId: req.user.id, // Ensure client belongs to the user
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Get client error:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create a new client
 * POST /api/clients
 */
export const createClient = async (req, res) => {
  try {
    const { name, niche, links, paymentRate, notes } = req.body;

    // Validate required fields
    if (!name || !niche || paymentRate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, niche, and paymentRate',
      });
    }

    // Validate paymentRate is a number and positive
    if (typeof paymentRate !== 'number' || paymentRate < 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment rate must be a positive number',
      });
    }

    // Validate links array if provided
    if (links && Array.isArray(links)) {
      for (const link of links) {
        if (link.url && !/^https?:\/\/.+/.test(link.url)) {
          return res.status(400).json({
            success: false,
            message: 'All links must have valid URLs',
          });
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
    console.error('Create client error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update a client
 * PUT /api/clients/:id
 */
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, niche, links, paymentRate, notes } = req.body;

    // Find client and ensure it belongs to the user
    let client = await Client.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Validate paymentRate if provided
    if (paymentRate !== undefined) {
      if (typeof paymentRate !== 'number' || paymentRate < 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment rate must be a positive number',
        });
      }
    }

    // Validate links array if provided
    if (links && Array.isArray(links)) {
      for (const link of links) {
        if (link.url && !/^https?:\/\/.+/.test(link.url)) {
          return res.status(400).json({
            success: false,
            message: 'All links must have valid URLs',
          });
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
    console.error('Update client error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID format',
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete a client
 * DELETE /api/clients/:id
 */
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete client (ensure it belongs to the user)
    const client = await Client.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Delete client error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
