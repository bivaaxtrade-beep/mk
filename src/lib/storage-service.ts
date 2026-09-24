import { v2 as cloudinary } from 'cloudinary';
import { getAppSetting } from '../services/settingsService.ts';
import logger from './logger.ts';

let isCloudinaryConfigured = false;

/**
 * Configure Cloudinary from PostgreSQL app_settings or environment variables
 */
export async function getCloudinaryClient() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL || await getAppSetting<string>('cloudinaryUrl');
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || await getAppSetting<string>('cloudinaryCloudName');
  const apiKey = process.env.CLOUDINARY_API_KEY || await getAppSetting<string>('cloudinaryApiKey');
  const apiSecret = process.env.CLOUDINARY_API_SECRET || await getAppSetting<string>('cloudinaryApiSecret');

  if (cloudinaryUrl) {
    cloudinary.config({ url: cloudinaryUrl });
    isCloudinaryConfigured = true;
    return cloudinary;
  }

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    isCloudinaryConfigured = true;
    return cloudinary;
  }

  return null;
}

/**
 * Upload an image (base64 string or data URI) to permanent Cloud Storage (Cloudinary / DB)
 * Returns the permanent HTTPS URL or clean Data URI
 */
export async function uploadImage(
  imageData: string,
  folder = 'bivaax_kyc',
  publicIdPrefix = 'doc'
): Promise<{ url: string; provider: 'cloudinary' | 'database' }> {
  if (!imageData) {
    throw new Error('Image data is required for upload');
  }

  // 1. Try Cloudinary first if configured
  try {
    const cClient = await getCloudinaryClient();
    if (cClient) {
      const uploadRes = await cClient.uploader.upload(imageData, {
        folder: folder,
        public_id: `${publicIdPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        resource_type: 'image',
        quality: 'auto:good'
      });

      if (uploadRes && uploadRes.secure_url) {
        logger.info(`File uploaded successfully to Cloudinary: ${uploadRes.secure_url}`);
        return { url: uploadRes.secure_url, provider: 'cloudinary' };
      }
    }
  } catch (err: any) {
    logger.warn(`Cloudinary upload failed (${err.message}). Falling back to durable PostgreSQL storage.`);
  }

  // 2. Fallback to durable Base64 Data URI stored in PostgreSQL database
  // Clean and ensure valid data URI format
  let formattedData = imageData;
  if (!formattedData.startsWith('data:image/')) {
    formattedData = `data:image/jpeg;base64,${formattedData}`;
  }

  return { url: formattedData, provider: 'database' };
}
