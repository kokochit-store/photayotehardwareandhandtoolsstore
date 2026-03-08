import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.jpeg')" }} />
      
      {/* Warm overlay */}
      {/* Dark base for contrast */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Warm accent gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(30,85%,45%)]/50 via-transparent to-[hsl(20,70%,25%)]/60" />

      <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
        <div className="max-w-2xl space-y-6">
          

          
          



          
          <p className="text-base md:text-lg text-primary-foreground/90 max-w-md leading-relaxed drop-shadow">
            Hand tools, power tools နှင့် accessories အမျိုးမျိုးကို 
            ဈေးနှုန်းသက်သာစွာ ရယူလိုက်ပါ။ အရည်အသွေး အာမခံပါတယ်။
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="gap-2 shadow-lg">
              <Link to="/products">
                ဈေးဝယ်ရန် <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-background/20 text-primary-foreground border-primary-foreground/30 hover:bg-background/30 backdrop-blur-sm">
              <Link to="/products">ပစ္စည်းအားလုံး ကြည့်ရန်</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>);

};

export default HeroSection;