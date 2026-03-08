import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent via-background to-secondary">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-2xl space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            Hand Tools · Power Tools · Accessories
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight text-foreground">
            စက်ကိရိယာ
            <br />
            <span className="text-primary">အကောင်းဆုံး</span>များ
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
            Hand tools, power tools နှင့် accessories အမျိုးမျိုးကို 
            ဈေးနှုန်းသက်သာစွာ ရယူလိုက်ပါ။ အရည်အသွေး အာမခံပါတယ်။
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link to="/products">
                ဈေးဝယ်ရန် <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/products">ပစ္စည်းအားလုံး ကြည့်ရန်</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default HeroSection;
