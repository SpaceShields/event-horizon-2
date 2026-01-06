import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  StockImage,
  UploadResult,
  ImageValidationResult,
  StockImageCache,
} from '@/lib/types/storage'
import { STORAGE_CONFIG } from '@/lib/types/storage'

/**
 * Generates a random alphanumeric ID for file naming
 */
function generateRandomId(length: number = 5): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Sanitizes a filename for safe storage
 * Removes special characters and spaces, converts to lowercase
 */
function sanitizeFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  const baseName = fileName.slice(0, fileName.lastIndexOf('.'))

  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)

  return `${sanitized || 'image'}.${extension}`
}

/**
 * Validates an image file against size and type restrictions
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check MIME type
  if (!file.type.startsWith(STORAGE_CONFIG.ALLOWED_MIME_PREFIX)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Only image files are allowed.`,
    }
  }

  // Check file size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `File too large: ${fileSizeMB} MB. Maximum size is ${maxSizeMB} MB.`,
    }
  }

  return { valid: true }
}

/**
 * Constructs the public URL for a storage object
 */
export function getStoragePublicUrl(
  supabase: SupabaseClient,
  path: string
): string {
  const { data } = supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .getPublicUrl(path)
  return data.publicUrl
}

/**
 * Retrieves cached stock images from localStorage
 */
function getCachedStockImages(): StockImage[] | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(STORAGE_CONFIG.CACHE_KEY)
    if (!cached) return null

    const data: StockImageCache = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid
    if (now - data.timestamp < STORAGE_CONFIG.CACHE_TTL) {
      return data.images
    }

    // Cache expired, remove it
    localStorage.removeItem(STORAGE_CONFIG.CACHE_KEY)
    return null
  } catch {
    return null
  }
}

/**
 * Caches stock images to localStorage
 */
function cacheStockImages(images: StockImage[]): void {
  if (typeof window === 'undefined') return

  try {
    const cacheData: StockImageCache = {
      images,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_CONFIG.CACHE_KEY, JSON.stringify(cacheData))
  } catch {
    // localStorage might be full or disabled, ignore
  }
}

/**
 * Fetches the list of stock images from the storage bucket
 * Uses localStorage caching with 5-minute TTL
 */
export async function fetchStockImages(
  supabase: SupabaseClient
): Promise<StockImage[]> {
  // Check cache first
  const cached = getCachedStockImages()
  if (cached) {
    return cached
  }

  // Fetch from Supabase Storage
  const { data, error } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .list(STORAGE_CONFIG.STOCK_FOLDER, {
      sortBy: { column: 'name', order: 'asc' },
    })

  if (error) {
    throw new Error(`Failed to fetch stock images: ${error.message}`)
  }

  // Filter out folders and non-image files, then map to StockImage format
  const images: StockImage[] = (data || [])
    .filter((file) => {
      // Skip folders (they have null id) and placeholder files
      if (!file.id || file.name === '.emptyFolderPlaceholder') return false
      // Only include common image extensions
      const ext = file.name.split('.').pop()?.toLowerCase()
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(ext || '')
    })
    .map((file) => ({
      name: file.name,
      url: getStoragePublicUrl(
        supabase,
        `${STORAGE_CONFIG.STOCK_FOLDER}/${file.name}`
      ),
    }))

  // Cache the results
  cacheStockImages(images)

  return images
}

/**
 * Uploads a custom image to the user's folder in storage
 * Path format: custom/{userId}/{timestamp}-{randomId}-{sanitizedFileName}
 */
export async function uploadCustomImage(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<UploadResult> {
  // Validate the file first
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Generate unique file path
  const timestamp = Date.now()
  const randomId = generateRandomId()
  const sanitizedName = sanitizeFileName(file.name)
  const path = `${STORAGE_CONFIG.CUSTOM_FOLDER}/${userId}/${timestamp}-${randomId}-${sanitizedName}`

  // Upload the file
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Get the public URL
  const url = getStoragePublicUrl(supabase, path)

  return { url, path }
}

/**
 * Deletes a custom image from storage
 */
export async function deleteCustomImage(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

/**
 * Extracts the storage path from a full Supabase Storage URL
 * Returns null if URL is not a valid Supabase Storage URL
 */
export function extractStoragePath(url: string): string | null {
  if (!url) return null

  // Match Supabase Storage URL pattern
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
  return match ? match[1] : null
}

/**
 * Determines if a URL is from Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url) return false
  return url.includes('supabase.co/storage') || url.includes('supabase.in/storage')
}

/**
 * Determines if an image URL is a stock image
 */
export function isStockImageUrl(url: string): boolean {
  if (!isSupabaseStorageUrl(url)) return false
  return url.includes(`/${STORAGE_CONFIG.STOCK_FOLDER}/`)
}

/**
 * Determines if an image URL is a custom uploaded image
 */
export function isCustomImageUrl(url: string): boolean {
  if (!isSupabaseStorageUrl(url)) return false
  return url.includes(`/${STORAGE_CONFIG.CUSTOM_FOLDER}/`)
}

/**
 * Clears the stock images cache (useful for testing or manual refresh)
 */
export function clearStockImagesCache(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_CONFIG.CACHE_KEY)
}
