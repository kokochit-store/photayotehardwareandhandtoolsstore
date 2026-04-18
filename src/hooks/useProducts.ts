import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbProduct {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  cost_price: number;
  sell_price: number;
  stock: number;
  image_url: string | null;
  description: string | null;
}

export const PAGE_SIZE = 24;

interface UseProductsArgs {
  search: string;
  category: string;
  page: number;
}

export function useProducts({ search, category, page }: UseProductsArgs) {
  return useQuery({
    queryKey: ["products", search, category, page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .order("stock", { ascending: false })
        .order("name", { ascending: true })
        .range(from, to);

      if (category && category !== "အားလုံး") {
        query = query.eq("category", category);
      }
      if (search.trim()) {
        const term = search.trim();
        query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data as DbProduct[], count: count ?? 0 };
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null);
      if (error) throw error;
      const set = new Set<string>();
      data?.forEach((r: any) => r.category && set.add(r.category));
      return ["အားလုံး", ...Array.from(set).sort()];
    },
    staleTime: 5 * 60 * 1000,
  });
}
