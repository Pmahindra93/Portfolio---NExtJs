-- Create storage bucket for post images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Create storage policies for the post-images bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'post-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public access to view images  
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'post-images');

-- Allow authenticated users to delete their own uploads (optional)
CREATE POLICY "Users can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'post-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own uploads (optional)
CREATE POLICY "Users can update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'post-images' 
  AND auth.role() = 'authenticated'
);
