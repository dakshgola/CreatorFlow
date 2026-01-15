import express from 'express';
import {
  listClients,
  createClient,
  getClient,
  updateClient,
  deleteClient,
} from '../controllers/clientsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

/**
 * @route   GET /api/clients
 * @desc    Get all clients for authenticated user
 * @access  Private
 */
router.get('/', listClients);

/**
 * @route   POST /api/clients
 * @desc    Create a new client
 * @access  Private
 */
router.post('/', createClient);

/**
 * @route   GET /api/clients/:id
 * @desc    Get a single client by ID
 * @access  Private
 */
router.get('/:id', getClient);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update a client
 * @access  Private
 */
router.put('/:id', updateClient);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete a client
 * @access  Private
 */
router.delete('/:id', deleteClient);

export default router;
