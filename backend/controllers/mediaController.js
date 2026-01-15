import Media from '../models/Media.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/utils/cloudinary.js';

/**
 * Upload media file to Cloudinary and save to database
 * POST /api/media/upload
 */
export const uploadMedia = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please provide an image file.',
      });
    }

    // Validate file type (only images)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.',
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit.',
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: `creatorflow/${req.user.id}`, // Organize by user ID
      resource_type: 'image',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    // Save media record to database
    const media = await Media.create({
      userId: req.user.id,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: media,
    });
  } catch (error) {
    console.error('Upload media error:', error);

    // Handle Cloudinary errors
    if (error.message.includes('Cloudinary')) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload to Cloudinary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
      message: 'Server error while uploading media',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all media for authenticated user
 * GET /api/media
 */
export const listMedia = async (req, res) => {
  try {
    const media = await Media.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({
      success: true,
      count: media.length,
      data: media,
    });
  } catch (error) {
    console.error('List media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching media',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get single media by ID
 * GET /api/media/:id
 */
export const getMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findOne({
      _id: id,
      userId: req.user.id, // Ensure media belongs to the user
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found',
      });
    }

    res.json({
      success: true,
      data: media,
    });
  } catch (error) {
    console.error('Get media error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid media ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching media',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete media from Cloudinary and database
 * DELETE /api/media/:id
 */
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    // Find media and ensure it belongs to the user
    const media = await Media.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found',
      });
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(media.publicId, {
        resource_type: 'image',
        invalidate: true,
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary delete fails
      // (media might already be deleted from Cloudinary)
    }

    // Delete from database
    await Media.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Media deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Delete media error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid media ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting media',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
