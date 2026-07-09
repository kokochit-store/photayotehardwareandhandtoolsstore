import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => (
  <footer className="bg-slate-900 text-white/80 pt-16 pb-8 mt-8">
    <div className="container mx-auto px-4">
      {/* Newsletter */}
      <div className="rounded-3xl bg-gradient-to-br from-primary to-orange-600 p-8 md:p-10 -mt-32 mb-16 shadow-orange grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h3 className="font-display text-2xl md:text-3xl text-white uppercase mb-2">
            Subscribe & Save
          </h3>
          <p className="text-white/90 text-sm md:text-base">
            အထူးဈေးနှုန်းများ၊ ပစ္စည်းအသစ်များအား ဦးဆုံးရရှိရန် စာရင်းသွင်းပါ။
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            type="email"
            placeholder="your@email.com"
            className="h-12 rounded-xl bg-white/95 border-transparent text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" size="lg" className="h-12 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Subscribe</span>
          </Button>
        </form>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-12">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-orange grid place-items-center">
              <span className="font-display text-white text-lg">ဖ</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm text-white uppercase">ဖိုးတရုတ်</span>
              <span className="text-[10px] text-white/60 uppercase tracking-widest">Hardware Store</span>
            </div>
          </Link>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            လက်သုံးစက်သုံး စက်အပိုပစ္စည်းအမျိုးမျိုးကို ဈေးနှုန်းသက်သာစွာ။
          </p>
          <div className="flex gap-2">
            <a
              href="#"
              className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 grid place-items-center hover:bg-primary hover:border-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 grid place-items-center hover:bg-primary hover:border-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-white uppercase text-sm mb-4 tracking-wide">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
            <li><Link to="/products?category=Hand%20Tools" className="hover:text-primary transition-colors">Hand Tools</Link></li>
            <li><Link to="/products?category=Power%20Tools" className="hover:text-primary transition-colors">Power Tools</Link></li>
            <li><Link to="/products?category=Accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-white uppercase text-sm mb-4 tracking-wide">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="hover:text-primary transition-colors cursor-pointer">About Us</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Contact</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Returns Policy</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h4 className="font-display text-white uppercase text-sm mb-4 tracking-wide">Get in Touch</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>အမှတ်(၂၁) ဘုရင့်နောင်လမ်း၊ ပန်းတနော်မြို့၊ ဧရာဝတီတိုင်း</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <a href="tel:09796959551" className="hover:text-primary transition-colors">09-796959551</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <a href="mailto:thihanthu282@gmail.com" className="hover:text-primary transition-colors break-all">thihanthu282@gmail.com</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              <span>Mon–Sat, 8:00 AM – 6:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
        <p>© 2026 ဖိုးတရုတ် စက်အပိုပစ္စည်း — All rights reserved.</p>
        <p>Built with quality for professionals.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
