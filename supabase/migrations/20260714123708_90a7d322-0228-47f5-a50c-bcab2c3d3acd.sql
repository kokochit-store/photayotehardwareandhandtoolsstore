
-- Sales tracking tables for daily/monthly/yearly reports
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total numeric NOT NULL DEFAULT 0,
  item_count integer NOT NULL DEFAULT 0,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sales" ON public.sales
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone authenticated or anon can insert sales" ON public.sales
  FOR INSERT TO anon, authenticated WITH CHECK (true);
GRANT INSERT ON public.sales TO anon;
CREATE POLICY "Admins can update sales" ON public.sales
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sales" ON public.sales
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id bigint,
  product_name text NOT NULL,
  qty integer NOT NULL,
  unit_price numeric NOT NULL,
  line_total numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_items TO authenticated;
GRANT INSERT ON public.sale_items TO anon;
GRANT ALL ON public.sale_items TO service_role;

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sale_items" ON public.sale_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert sale_items" ON public.sale_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can update sale_items" ON public.sale_items
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sale_items" ON public.sale_items
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX idx_sale_items_sale_id ON public.sale_items(sale_id);
