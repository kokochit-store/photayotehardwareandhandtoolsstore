import { ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const formatPrice = (price: number) => {
  return price.toLocaleString() + " ကျပ်";
};

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} ထည့်လိုက်ပါပြီ`);
  };

  return (
    <div className="group rounded-lg overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${
            product.badge === "Sale"
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground"
          }`}>
            {product.badge}
          </span>
        )}
        <button
          onClick={handleAdd}
          className="absolute bottom-3 right-3 p-2.5 rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <h3 className="font-medium text-sm truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-display font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
