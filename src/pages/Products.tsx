import { useState, useEffect } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useProducts, useCategories, PAGE_SIZE, type DbProduct } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";

const toCardProduct = (p: DbProduct): Product => ({
  id: String(p.id),
  name: p.name,
  price: Number(p.sell_price),
  image: p.image_url || "/placeholder.svg",
  category: p.category || "Other",
  description: p.description || "",
});

const Products = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("အားလုံး");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeCategory]);

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

  return (
    <main>
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">ပစ္စည်းအားလုံး</h1>
        <p className="text-muted-foreground text-sm mb-6">
          စုစုပေါင်း {totalCount.toLocaleString()} မျိုး ရရှိနိုင်ပါတယ်
        </p>

        <div className="relative mb-6 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ပစ္စည်းအမည် သို့မဟုတ် SKU နှင့် ရှာရန်..."
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
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
            <p>ပစ္စည်းမတွေ့ပါ</p>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 ${isFetching ? "opacity-60 transition-opacity" : ""}`}>
              {products.map((p) => (
                <ProductCard key={p.id} product={toCardProduct(p)} />
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 mt-10 flex-wrap">
              <p className="text-sm text-muted-foreground">
                စာမျက်နှာ {page} / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  အရင်
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  နောက်
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
