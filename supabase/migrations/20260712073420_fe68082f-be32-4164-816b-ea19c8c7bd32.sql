
-- Switch products_public to security_invoker so it no longer bypasses RLS
ALTER VIEW public.products_public SET (security_invoker = on);

-- Allow public catalog reads on products, but hide cost_price via column-level privileges
CREATE POLICY "Public can view products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

-- Revoke all column privileges then grant only safe columns (exclude cost_price)
REVOKE SELECT ON public.products FROM anon, authenticated;
GRANT SELECT (id, name, sku, category, description, image_url, stock, sell_price, created_at, updated_at) ON public.products TO anon, authenticated;

-- Ensure the view itself is readable
GRANT SELECT ON public.products_public TO anon, authenticated;
