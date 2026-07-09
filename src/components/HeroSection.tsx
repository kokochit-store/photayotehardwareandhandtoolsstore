import { ArrowRight, ShieldCheck, Truck, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-slate-900">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/images/hero-bg.jpeg')" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-hero" />
      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 py-16 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-sm text-primary-foreground text-xs font-semibold uppercase tracking-widest mb-6 animate-fade-in">
            <Wrench className="h-3.5 w-3.5" />
            Professional Grade Tools
          </span>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-5 uppercase tracking-tight animate-fade-in">
            Build Better.
            <br />
            <span className="text-primary">Work Smarter.</span>
          </h1>

          <p className="text-base md:text-lg text-white/80 max-w-xl leading-relaxed mb-8 animate-fade-in">
            Hand tools, power tools, safety gear နှင့် accessories အမျိုးမျိုးကို
            ဈေးနှုန်းသက်သာစွာ ရယူပါ။ အရည်အသွေး အာမခံ။ မြန်ဆန်သော ပို့ဆောင်မှု။
          </p>

          <div className="flex flex-wrap gap-3 mb-12 animate-fade-in">
            <Button asChild size="lg" className="h-12 px-7 rounded-xl gap-2 shadow-orange text-base font-semibold">
              <Link to="/products">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-7 rounded-xl bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white backdrop-blur-sm text-base font-semibold"
            >
              <Link to="/products">Browse Categories</Link>
            </Button>
          </div>

          {/* Mini trust bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
            {[
              { icon: Truck, label: "Fast Delivery", sub: "မြန်ဆန်သော ပို့ဆောင်မှု" },
              { icon: ShieldCheck, label: "Quality Guarantee", sub: "အာမခံ ပစ္စည်းများ" },
              { icon: Wrench, label: "1000+ Tools", sub: "ရွေးချယ်စရာ များစွာ" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 text-white">
                <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 grid place-items-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{label}</p>
                  <p className="text-xs text-white/60 truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
