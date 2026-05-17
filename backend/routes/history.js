import express from 'express';
import { getHistory, toggleSaveHistory, deleteHistory, getSavedHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getHistory);
router.get('/saved', getSavedHistory);
router.patch('/:id/save', toggleSaveHistory);
router.delete('/:id', deleteHistory);

export default router;
