const Footer = () => (
  <footer className="bg-secondary/50 border-t border-border mt-20">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-lg font-bold mb-3">
            SHOP<span className="text-primary">.</span>MM
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            အရည်အသွေးမြင့် ပစ္စည်းများကို ဈေးနှုန်းသက်သာစွာ ရရှိနိုင်ပါတယ်။
          </p>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-3">Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="hover:text-foreground transition-colors cursor-pointer">ကျွန်ုပ်တို့အကြောင်း</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">ဆက်သွယ်ရန်</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-3">ဆက်သွယ်ရန်</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>📞 09-123-456-789</li>
            <li>✉️ hello@shop.mm</li>
            <li>📍 ရန်ကုန်မြို့</li>
          </ul>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © 2026 SHOP.MM — All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
