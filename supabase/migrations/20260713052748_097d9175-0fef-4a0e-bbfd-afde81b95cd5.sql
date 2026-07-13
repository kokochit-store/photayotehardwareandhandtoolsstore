CREATE POLICY "Public can view product catalog"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);