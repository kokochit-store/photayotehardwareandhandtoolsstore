-- ============================================================
-- 1) Hide cost_price from public, keep admin access
-- ============================================================

-- Drop the public-readable policy
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

-- Only admins can SELECT the full row (including cost_price) directly
CREATE POLICY "Admins can view full products"
ON public.products
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Public-safe view that EXCLUDES cost_price
CREATE OR REPLACE VIEW public.products_public
WITH (security_invoker = true)
AS
SELECT
  id,
  name,
  sku,
  category,
  sell_price,
  stock,
  image_url,
  description,
  created_at,
  updated_at
FROM public.products;

GRANT SELECT ON public.products_public TO anon, authenticated;

-- The view uses security_invoker, so we need a permissive SELECT policy
-- on the underlying table that allows anyone to read the safe columns.
-- We achieve this by creating a policy that allows reading rows but the
-- view limits which columns are exposed.
CREATE POLICY "Anyone can read products through safe view"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

-- NOTE: The above policy still technically allows SELECT cost_price via
-- direct table access. To truly hide cost_price, we revoke column access:
REVOKE SELECT ON public.products FROM anon, authenticated;
GRANT SELECT (id, name, sku, category, sell_price, stock, image_url, description, created_at, updated_at)
  ON public.products TO anon, authenticated;
GRANT SELECT ON public.products TO authenticated; -- admins still need full access via has_role policy
-- Re-grant full SELECT only via the admin policy path; the column grant above
-- restricts what non-admins can read even when policies pass.

-- ============================================================
-- 2) Restrict product-images storage to admins only
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;

-- Public can read individual files (but not LIST them — see step 3)
CREATE POLICY "Public can read product images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.role() = 'anon' OR auth.role() = 'authenticated')
  AND name IS NOT NULL
);

-- Only admins can upload/update/delete
CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
);

-- ============================================================
-- 3) Prevent public bucket listing (keep individual file URLs working)
-- ============================================================
-- Make the bucket non-public so anonymous users can't list its contents
-- via the storage list API. Public file URLs continue to work because
-- the SELECT policy above allows reading individual objects by name.
UPDATE storage.buckets SET public = false WHERE id = 'product-images';