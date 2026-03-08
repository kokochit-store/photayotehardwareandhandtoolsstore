import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { products, categories } from "@/data/products";

const Products = () => {
  const [activeCategory, setActiveCategory] = useState<string>("အားလုံး");

  const filtered =
    activeCategory === "အားလုံး"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <main>
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">ပစ္စည်းအားလုံး</h1>
        <p className="text-muted-foreground text-sm mb-8">
          ပစ္စည်း {filtered.length} မျိုး ရရှိနိုင်ပါတယ်
        </p>

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>ဤအမျိုးအစားတွင် ပစ္စည်းမရှိပါ</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default Products;
