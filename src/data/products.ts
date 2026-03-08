export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  badge?: string;
}

export const categories = [
  "အားလုံး",
  "Hand Tools",
  "Power Tools",
  "Accessories",
] as const;

export const products: Product[] = [
  {
    id: "1",
    name: "Professional Claw Hammer",
    price: 16000,
    originalPrice: 16000,
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&h=600&fit=crop",
    category: "Hand Tools",
    description: "အရည်အသွေးမြင့် သံချောင်းလက်ကိုင်ပါ claw hammer ဖြစ်ပါတယ်။ အိမ်သုံးနှင့် လုပ်ငန်းသုံး နှစ်မျိုးလုံး သင့်တော်ပါတယ်။",
    badge: "Sale",
  },
  {
    id: "2",
    name: "Cordless Impact Drill 20V",
    price: 2800000,
    image: "/lovable-uploads/175750a5-0b60-4910-82ff-f0342295a3b3.png",
    category: "Power Tools",
    description: "20V Li-ion battery ပါဝင်သော cordless impact drill ဖြစ်ပါတယ်။ သစ်သား၊ သံ၊ ကွန်ကရစ် အားလုံး ဖောက်နိုင်ပါတယ်။",
    badge: "New",
  },
  {
    id: "3",
    name: "Screwdriver Set (12 pcs)",
    price: 45000,
    image: "/lovable-uploads/c0451941-5682-49f0-a0b6-5332cae2820b.png",
    category: "Hand Tools",
    description: "Flathead နှင့် Phillips head အမျိုးမျိုး ပါဝင်သော screwdriver set ဖြစ်ပါတယ်။",
  },
  {
    id: "4",
    name: "Safety Goggles",
    price: 18000,
    image: "/lovable-uploads/544ca2dd-9567-470d-938f-53b2d00bcedc.png",
    category: "Accessories",
    description: "ဖုန်မှုန့်နှင့် အစအန ကာကွယ်ပေးနိုင်သော safety goggles ဖြစ်ပါတယ်။",
  },
   {
     id: "5",
     name: "Angle Grinder 750W",
     price: 55000,
     originalPrice: 68000,
     image: "/lovable-uploads/dffe4522-4fd5-4e4b-9586-5ad90a2ddc59.png",
     category: "Power Tools",
     description: "750W motor ပါဝင်သော angle grinder ဖြစ်ပြီး သံဖြတ်ခြင်း၊ သွေးခြင်း အတွက် သင့်တော်ပါတယ်။",
     badge: "Sale",
   },
  {
    id: "6",
    name: "Measuring Tape 3m",
    price: 4500,
    image: "/lovable-uploads/measuring-tape-3m.png",
    category: "Accessories",
    description: "3 မီတာ အရှည်ရှိသော ကြံ့ခိုင်သည့် measuring tape ဖြစ်ပါတယ်။",
    badge: "New",
  },
  {
    id: "7",
    name: "Adjustable Wrench 12\"",
    price: 50000,
    image: "/lovable-uploads/adjustable-wrench-12.png",
    category: "Hand Tools",
    description: "12 လက်မ adjustable wrench ဖြစ်ပြီး chrome vanadium steel ဖြင့် ပြုလုပ်ထားပါတယ်။",
  },
  {
    id: "8",
    name: "Circular Saw 1200W 185mm",
    price: 320000,
    image: "/lovable-uploads/circular-saw-1200w.png",
    category: "Power Tools",
    description: "1400W circular saw ဖြစ်ပြီး သစ်သားဖြတ်တောက်ခြင်း အတွက် အထူးသင့်တော်ပါတယ်။",
  },
  {
    id: "9",
    name: "Work Gloves (Heavy Duty)",
    price: 12000,
    image: "/lovable-uploads/work-gloves.png",
    category: "Accessories",
    description: "အရည်အသွေးမြင့် leather work gloves ဖြစ်ပြီး လက်ကို ကာကွယ်ပေးပါတယ်။",
  },
];
