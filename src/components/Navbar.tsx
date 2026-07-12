import { ShoppingBag, Search, Menu, X, Heart, User } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const categories = [
  "Hand Tools",
  "Power Tools",
  "Measuring",
  "Electrical",
  "Plumbing",
  "Safety",
  "Fasteners",
  "Accessories",
];

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      {/* Top announcement */}
      <div className="bg-slate-900 text-white text-xs">
        <div className="container mx-auto px-4 h-8 flex items-center justify-between">
          <span className="tracking-wide">အရည်အသွေးအကောင်းဆုံး အာမခံပါကုန်ပစ္စည်းများနဲ့ စိတ်ချမ်းသာစွာ သုံးလိုက်ပါ</span>
          <span className="hidden sm:inline text-white/70">📞 09-796959551</span>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center gap-4 md:gap-8">
        <button
          className="md:hidden p-2 -ml-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-gradient-orange grid place-items-center shadow-orange">
            <span className="font-display text-white text-lg">ဖ</span>
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-sm md:text-base text-foreground uppercase tracking-wide">ဖိုးတရုတ်</span>
            <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">Hardware Store</span>
          </div>
        </Link>

        {/* Search - desktop */}
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hand tools, power tools, SKU..."
            className="pl-11 pr-24 h-11 rounded-xl bg-secondary/60 border-transparent focus-visible:border-primary focus-visible:bg-background"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            Search
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          <button
            onClick={() => setMobileSearchOpen((s) => !s)}
            className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="hidden sm:flex p-2.5 rounded-full hover:bg-secondary transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5 text-foreground/70" />
          </button>
          <Link
            to="/auth"
            className="hidden sm:flex p-2.5 rounded-full hover:bg-secondary transition-colors"
            aria-label="Account"
          >
            <User className="h-5 w-5 text-foreground/70" />
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full hover:bg-secondary transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5 text-foreground/80" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-orange">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="md:hidden container mx-auto px-4 pb-3 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-10 h-11 rounded-xl bg-secondary/60 border-transparent" />
          </div>
        </div>
      )}

      {/* Category nav */}
      <nav className="hidden md:block border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 h-11 overflow-x-auto scrollbar-hide">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? "text-primary bg-accent" : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              ပင်မ
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? "text-primary bg-accent" : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              All Products
            </NavLink>
            <span className="h-4 w-px bg-border mx-2" />
            {categories.map((c) => (
              <Link
                key={c}
                to={`/products?category=${encodeURIComponent(c)}`}
                className="px-3 py-1.5 rounded-lg text-sm text-foreground/70 hover:text-primary hover:bg-secondary transition-colors whitespace-nowrap"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container mx-auto px-4 py-3 flex flex-col">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm font-medium">
              ပင်မစာမျက်နှာ
            </Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm font-medium">
              All Products
            </Link>
            <div className="h-px bg-border my-2" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider py-2">Categories</p>
            {categories.map((c) => (
              <Link
                key={c}
                to={`/products?category=${encodeURIComponent(c)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm text-foreground/80"
              >
                {c}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
