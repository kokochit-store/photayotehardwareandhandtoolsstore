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
    price: 280000,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop",
    category: "Power Tools",
    description: "20V Li-ion battery ပါဝင်သော cordless impact drill ဖြစ်ပါတယ်။ သစ်သား၊ သံ၊ ကွန်ကရစ် အားလုံး ဖောက်နိုင်ပါတယ်။",
    badge: "New",
  },
  {
    id: "3",
    name: "Screwdriver Set (12 pcs)",
    price: 15000,
    image: "https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=600&h=600&fit=crop",
    category: "Hand Tools",
    description: "Flathead နှင့် Phillips head အမျိုးမျိုး ပါဝင်သော screwdriver set ဖြစ်ပါတယ်။",
  },
  {
    id: "4",
    name: "Safety Goggles",
    price: 5500,
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=600&fit=crop",
    category: "Accessories",
    description: "ဖုန်မှုန့်နှင့် အစအန ကာကွယ်ပေးနိုင်သော safety goggles ဖြစ်ပါတယ်။",
  },
  {
    id: "5",
    name: "Angle Grinder 750W",
    price: 55000,
    originalPrice: 68000,
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop",
    category: "Power Tools",
    description: "750W motor ပါဝင်သော angle grinder ဖြစ်ပြီး သံဖြတ်ခြင်း၊ သွေးခြင်း အတွက် သင့်တော်ပါတယ်။",
    badge: "Sale",
  },
  {
    id: "6",
    name: "Measuring Tape 5m",
    price: 4500,
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=600&fit=crop",
    category: "Accessories",
    description: "5 မီတာ အရှည်ရှိသော ကြံ့ခိုင်သည့် measuring tape ဖြစ်ပါတယ်။",
    badge: "New",
  },
  {
    id: "7",
    name: "Adjustable Wrench 10\"",
    price: 9000,
    image: "https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?w=600&h=600&fit=crop",
    category: "Hand Tools",
    description: "10 လက်မ adjustable wrench ဖြစ်ပြီး chrome vanadium steel ဖြင့် ပြုလုပ်ထားပါတယ်။",
  },
  {
    id: "8",
    name: "Circular Saw 1400W",
    price: 95000,
    image: "https://images.unsplash.com/photo-1616712134411-6b6ae89bc3ba?w=600&h=600&fit=crop",
    category: "Power Tools",
    description: "1400W circular saw ဖြစ်ပြီး သစ်သားဖြတ်တောက်ခြင်း အတွက် အထူးသင့်တော်ပါတယ်။",
  },
  {
    id: "9",
    name: "Work Gloves (Heavy Duty)",
    price: 6500,
    image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=600&h=600&fit=crop",
    category: "Accessories",
    description: "အရည်အသွေးမြင့် leather work gloves ဖြစ်ပြီး လက်ကို ကာကွယ်ပေးပါတယ်။",
  },
];
