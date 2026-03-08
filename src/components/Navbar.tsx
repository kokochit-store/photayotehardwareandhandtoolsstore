import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          className="md:hidden p-2 -ml-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="font-display text-lg font-bold tracking-tight text-foreground">
          ဖိုးတရုတ်<span className="text-primary"> စက်အပိုပစ္စည်း</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            ပင်မစာမျက်နှာ
          </Link>
          <Link to="/products" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            ပစ္စည်းများ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-secondary transition-colors">
            <Search className="h-5 w-5 text-foreground/70" />
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-foreground/70" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 text-foreground/70 hover:text-foreground">
              ပင်မစာမျက်နှာ
            </Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 text-foreground/70 hover:text-foreground">
              ပစ္စည်းများ
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
