
CREATE OR REPLACE FUNCTION public.admin_list_products()
RETURNS SETOF public.products
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'access denied' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.products ORDER BY id ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_products() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_products() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_low_stock(_threshold integer)
RETURNS SETOF public.products
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'access denied' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.products WHERE stock <= _threshold ORDER BY stock ASC, name ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_low_stock(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_low_stock(integer) TO authenticated;
