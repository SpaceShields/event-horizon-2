/**
 * Type definitions for Supabase Storage integration
 */

/**
 * Represents a stock image from the eventhorizon-images/stock/ folder
 */
export interface StockImage {
  /** File name in the storage bucket */
  name: string
  /** Full public URL to the image */
  url: string
}

/**
 * Result of a successful image upload
 */
export interface UploadResult {
  /** Public URL to access the uploaded image */
  url: string
  /** Storage path (relative to bucket root) */
  path: string
}

/**
 * Indicates whether the selected image is from stock or custom upload
 */
export type ImageSource = 'stock' | 'custom'

/**
 * Validation result for image file checks
 */
export interface ImageValidationResult {
  valid: boolean
  error?: string
}

/**
 * Cached stock images with timestamp for TTL management
 */
export interface StockImageCache {
  images: StockImage[]
  timestamp: number
}

/**
 * Constants for storage configuration
 */
export const STORAGE_CONFIG = {
  /** Name of the Supabase Storage bucket */
  BUCKET_NAME: 'eventhorizon-images',
  /** Folder for stock images */
  STOCK_FOLDER: 'stock',
  /** Folder for custom uploads */
  CUSTOM_FOLDER: 'custom',
  /** Maximum file size in bytes (25 MB) */
  MAX_FILE_SIZE: 25 * 1024 * 1024,
  /** Allowed MIME type prefix */
  ALLOWED_MIME_PREFIX: 'image/',
  /** Cache TTL in milliseconds (5 minutes) */
  CACHE_TTL: 5 * 60 * 1000,
  /** LocalStorage key for stock image cache */
  CACHE_KEY: 'eventhorizon_stock_images_cache',
} as const
