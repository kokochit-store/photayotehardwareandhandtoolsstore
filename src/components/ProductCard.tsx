import { ShoppingBag, Heart, Eye, Star } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const formatPrice = (price: number) => price.toLocaleString() + " ကျပ်";

interface ProductCardProps {
  product: Product & { sku?: string; stock?: number; rating?: number };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const rating = product.rating ?? 4.7;
  const inStock = product.stock === undefined ? true : product.stock > 0;
  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} ထည့်လိုက်ပါပြီ`);
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border hover-lift">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary/60">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discountPct > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-destructive text-destructive-foreground text-[11px] font-bold shadow-sm">
              -{discountPct}%
            </span>
          )}
          {product.badge && (
            <span
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm ${
                product.badge === "Sale"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {product.badge}
            </span>
          )}
          {!inStock && (
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-white text-[11px] font-bold">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/95 backdrop-blur grid place-items-center shadow-sm opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:text-primary"
          aria-label="Wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Hover actions */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 shadow-orange hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </button>
          <button
            className="h-10 w-10 rounded-xl bg-white/95 backdrop-blur grid place-items-center shadow-sm hover:bg-white hover:text-primary transition-colors"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {product.category}
          </p>
          {product.sku && (
            <p className="text-[10px] text-muted-foreground font-mono">SKU: {product.sku}</p>
          )}
        </div>

        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3 w-3 ${
                  s <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground/40"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">({rating.toFixed(1)})</span>
        </div>

        {/* Price + stock */}
        <div className="flex items-end justify-between mt-3 gap-2">
          <div className="flex flex-col">
            <span className="font-display text-base text-primary leading-none">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-muted-foreground line-through mt-1">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              inStock ? "text-emerald-600" : "text-destructive"
            }`}
          >
            {inStock ? "● In stock" : "○ Out"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
