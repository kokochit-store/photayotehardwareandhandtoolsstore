import { Link } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { useProducts, type DbProduct } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
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

interface FeaturedSectionProps {
  eyebrow: string;
  title: string;
  category?: string;
  limit?: number;
}

const FeaturedSection = ({ eyebrow, title, category, limit = 8 }: FeaturedSectionProps) => {
  const { data, isLoading } = useProducts({
    search: "",
    category: category ?? "အားလုံး",
    page: 1,
  });

  const products = (data?.data ?? []).slice(0, limit);

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">{eyebrow}</p>
            <h2 className="font-display text-3xl md:text-4xl uppercase">{title}</h2>
          </div>
          <Link
            to={category ? `/products?category=${encodeURIComponent(category)}` : "/products"}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground text-sm">ပစ္စည်း မတွေ့ပါ</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={toCardProduct(p)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;
