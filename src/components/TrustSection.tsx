import { ShieldCheck, Truck, Award, Headphones, RotateCcw } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Secure Payments", desc: "လုံခြုံသော ငွေပေးချေမှု" },
  { icon: Award, title: "Quality Guarantee", desc: "အရည်အသွေး အာမခံ" },
  { icon: Headphones, title: "24/7 Support", desc: "အချိန်ပြည့် ကူညီပေးမည်" },
  { icon: RotateCcw, title: "Easy Returns", desc: "လွယ်ကူသော ပြန်လဲမှု" },
];

const TrustSection = () => (
  <section className="py-14 md:py-16 bg-slate-900 text-white">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col items-center text-center gap-3 group"
          >
            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 grid place-items-center group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
              <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-display text-sm uppercase tracking-wide">{title}</p>
              <p className="text-xs text-white/60 mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
