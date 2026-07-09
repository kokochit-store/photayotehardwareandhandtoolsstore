import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useProducts, useCategories, PAGE_SIZE, type DbProduct } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";

const toCardProduct = (p: DbProduct): Product & { sku?: string; stock?: number } => ({
  id: String(p.id),
  name: p.name,
  price: Number(p.sell_price),
  image: p.image_url || "/placeholder.svg",
  category: p.category || "Other",
  description: p.description || "",
  sku: p.sku || undefined,
  stock: p.stock,
});

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "အားလုံး";
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeCategory]);

  useEffect(() => {
    const c = searchParams.get("category");
    if (c && c !== activeCategory) setActiveCategory(c);
  }, [searchParams]);

  const { data: catData } = useCategories();
  const { data, isLoading, isFetching } = useProducts({
    search: debouncedSearch,
    category: activeCategory,
    page,
  });

  const categories = catData ?? ["အားလုံး"];
  const products = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const setCategory = (c: string) => {
    setActiveCategory(c);
    if (c === "အားလုံး") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", c);
    }
    setSearchParams(searchParams);
  };

  return (
    <main>
      {/* Page header */}
      <section className="bg-slate-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Catalog</p>
          <h1 className="font-display text-4xl md:text-5xl uppercase mb-3">All Products</h1>
          <p className="text-white/70 text-sm md:text-base">
            စုစုပေါင်း {totalCount.toLocaleString()} မျိုး ရရှိနိုင်ပါတယ်
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        {/* Search + filter bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU..."
              className="pl-11 h-12 rounded-xl bg-secondary/60 border-transparent focus-visible:border-primary focus-visible:bg-background"
            />
          </div>
          <Button variant="outline" size="lg" className="h-12 rounded-xl gap-2 shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-orange"
                  : "bg-secondary text-foreground/70 hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>ဖွင့်နေပါသည်...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>ပစ္စည်း မတွေ့ပါ</p>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 ${isFetching ? "opacity-60 transition-opacity" : ""}`}>
              {products.map((p) => (
                <ProductCard key={p.id} product={toCardProduct(p)} />
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 mt-12 flex-wrap">
              <p className="text-sm text-muted-foreground">
                စာမျက်နှာ {page} / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default Products;
