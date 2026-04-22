-- Restore bucket public flag so direct public file URLs work via the CDN.
-- The public CDN serves individual files by URL without using RLS; listing
-- via the storage API still requires a SELECT policy on storage.objects.
UPDATE storage.buckets SET public = true WHERE id = 'product-images';

-- Drop the broad SELECT policy we added — without any SELECT policy,
-- the storage API list/select calls will return nothing for product-images,
-- but the public CDN endpoint continues to serve individual files.
DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;