import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Ko Aung",
    role: "Contractor",
    initials: "KA",
    text: "ပစ္စည်းအရည်အသွေး အလွန်ကောင်းပါတယ်။ ဈေးလည်း တန်ပါတယ်။ ပို့ဆောင်မှုကလည်း မြန်ဆန်ပါတယ်။",
    rating: 5,
  },
  {
    name: "Ma Thida",
    role: "Workshop Owner",
    initials: "MT",
    text: "Power tools အားလုံး original ဖြစ်ပြီး အာမခံပေးတယ်။ Customer service ကလည်း အလွန်ကောင်းပါတယ်။",
    rating: 5,
  },
  {
    name: "U Myint",
    role: "Electrician",
    initials: "UM",
    text: "Electrical tools တွေ ရွေးချယ်စရာ များစွာရှိပြီး တစ်နေရာတည်းမှာ ဝယ်လို့ရတယ်။ အလွန်လွယ်ကူပါတယ်။",
    rating: 5,
  },
];

const ReviewsSection = () => (
  <section className="py-16 md:py-24 bg-secondary/40">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Testimonials</p>
        <h2 className="font-display text-3xl md:text-4xl uppercase mb-3">What Our Customers Say</h2>
        <p className="text-muted-foreground text-sm md:text-base">
          ဖောက်သည်များ၏ ယုံကြည်မှုနှင့် ကျေနပ်မှုသည် ကျွန်ုပ်တို့၏ အဓိကရည်ရွယ်ချက်ဖြစ်ပါသည်။
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {reviews.map((r) => (
          <div
            key={r.name}
            className="relative bg-card rounded-2xl border border-border p-6 md:p-7 hover-lift"
          >
            <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/15" />
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed mb-6">{r.text}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="h-10 w-10 rounded-full bg-gradient-orange grid place-items-center font-display text-white text-sm">
                {r.initials}
              </div>
              <div>
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ReviewsSection;
