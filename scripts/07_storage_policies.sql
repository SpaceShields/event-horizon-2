-- Storage RLS policies for eventhorizon-images bucket
-- This migration sets up row-level security for the storage bucket
-- Applied via Supabase MCP migration tool

-- Allow authenticated users to upload to their own custom folder
-- Path pattern: custom/{user_id}/{filename}
CREATE POLICY "Users can upload to own custom folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'eventhorizon-images'
  AND (storage.foldername(name))[1] = 'custom'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to update their own custom images
CREATE POLICY "Users can update own custom images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'eventhorizon-images'
  AND (storage.foldername(name))[1] = 'custom'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'eventhorizon-images'
  AND (storage.foldername(name))[1] = 'custom'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to delete their own custom images
CREATE POLICY "Users can delete own custom images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'eventhorizon-images'
  AND (storage.foldername(name))[1] = 'custom'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow public read access to all images in the bucket
-- This covers both stock images and custom uploads (they should be public for event display)
CREATE POLICY "Public read access to all images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'eventhorizon-images');
