import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Initialize Cloudinary configuration
 * Uses CLOUDINARY_URL environment variable or individual config values
 */
const initializeCloudinary = () => {
  // Check if CLOUDINARY_URL is provided (format: cloudinary://api_key:api_secret@cloud_name)
  if (process.env.CLOUDINARY_URL) {
    // CLOUDINARY_URL is automatically parsed by Cloudinary SDK
    cloudinary.config();
  } else {
    // Fallback to individual environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Verify configuration
  const config = cloudinary.config();
  // Check if config values are empty strings or undefined
  const hasValidConfig = config.cloud_name && 
                        config.cloud_name.trim() !== '' && 
                        config.api_key && 
                        config.api_key.trim() !== '' && 
                        config.api_secret && 
                        config.api_secret.trim() !== '';
  
  if (!hasValidConfig) {
    console.warn('Warning: Cloudinary configuration is incomplete. Media uploads may not work.');
    console.warn('Please set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
  } else {
    console.log('Cloudinary initialized successfully');
  }
};

// Initialize on import
initializeCloudinary();

/**
 * Upload image to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: options.folder || 'creatorflow', // Default folder
      resource_type: options.resource_type || 'image',
      transformation: options.transformation || [],
      ...options,
    };

    // If file is a buffer, convert to data URI or use upload_stream
    let uploadResult;
    
    if (Buffer.isBuffer(file)) {
      // Upload from buffer using upload_stream
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file);
      });
    } else {
      // Upload from file path
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return uploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Delete options
 * @returns {Promise<Object>} Cloudinary delete result
 */
export const deleteFromCloudinary = async (publicId, options = {}) => {
  try {
    const deleteOptions = {
      resource_type: options.resource_type || 'image',
      invalidate: options.invalidate || true, // Invalidate CDN cache
      ...options,
    };

    const result = await cloudinary.uploader.destroy(publicId, deleteOptions);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

/**
 * Get Cloudinary configuration
 * @returns {Object} Current Cloudinary config
 */
export const getCloudinaryConfig = () => {
  return cloudinary.config();
};

export default cloudinary;
