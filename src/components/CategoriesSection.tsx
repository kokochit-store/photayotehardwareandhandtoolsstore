import { Link } from "react-router-dom";
import {
  Wrench,
  Zap,
  Ruler,
  Plug,
  Droplets,
  HardHat,
  Bolt,
  Package,
} from "lucide-react";

const categories = [
  { name: "Hand Tools", icon: Wrench, color: "from-orange-500/20 to-orange-600/10" },
  { name: "Power Tools", icon: Zap, color: "from-yellow-500/20 to-orange-500/10" },
  { name: "Measuring", icon: Ruler, color: "from-blue-500/20 to-slate-500/10" },
  { name: "Electrical", icon: Plug, color: "from-amber-500/20 to-yellow-500/10" },
  { name: "Plumbing", icon: Droplets, color: "from-sky-500/20 to-blue-500/10" },
  { name: "Safety", icon: HardHat, color: "from-red-500/20 to-orange-500/10" },
  { name: "Fasteners", icon: Bolt, color: "from-slate-500/20 to-slate-600/10" },
  { name: "Accessories", icon: Package, color: "from-emerald-500/20 to-teal-500/10" },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/40">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Shop by Category</p>
            <h2 className="font-display text-3xl md:text-4xl uppercase">Browse Categories</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
          {categories.map(({ name, icon: Icon, color }) => (
            <Link
              key={name}
              to={`/products?category=${encodeURIComponent(name)}`}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border p-5 md:p-6 hover-lift"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative flex flex-col items-start gap-4">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-secondary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Icon className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <div>
                  <h3 className="font-display text-base md:text-lg uppercase leading-tight">{name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                    Shop now →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
