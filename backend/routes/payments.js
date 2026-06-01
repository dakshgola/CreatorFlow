import express from 'express';
import {
  listPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../controllers/paymentsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to protect all routes
router.use(protect);

router.route('/')
  .get(listPayments)
  .post(createPayment);

router.route('/:id')
  .put(updatePayment)
  .delete(deletePayment);

export default router;
