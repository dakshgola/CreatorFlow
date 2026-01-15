import express from 'express';
import multer from 'multer';
import {
  uploadMedia,
  listMedia,
  getMedia,
  deleteMedia,
} from '../controllers/mediaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Configure multer for memory storage (to upload directly to Cloudinary)
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * @route   GET /api/media
 * @desc    Get all media for authenticated user
 * @access  Private
 */
router.get('/', listMedia);

/**
 * @route   POST /api/media/upload
 * @desc    Upload image to Cloudinary and save to database
 * @access  Private
 */
router.post('/upload', upload.single('image'), uploadMedia);

/**
 * @route   GET /api/media/:id
 * @desc    Get single media by ID
 * @access  Private
 */
router.get('/:id', getMedia);

/**
 * @route   DELETE /api/media/:id
 * @desc    Delete media from Cloudinary and database
 * @access  Private
 */
router.delete('/:id', deleteMedia);

export default router;
