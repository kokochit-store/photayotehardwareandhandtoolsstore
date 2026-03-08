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
  "အဝတ်အထည်",
  "ဖိနပ်",
  "အိတ်",
  "လက်ဝတ်ရတနာ",
] as const;

export const products: Product[] = [
  {
    id: "1",
    name: "Classic Cotton T-Shirt",
    price: 15000,
    originalPrice: 22000,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    category: "အဝတ်အထည်",
    description: "သက်တောင့်သက်သာ ဝတ်ဆင်နိုင်သော cotton t-shirt ဖြစ်ပါတယ်။ အရောင်အမျိုးမျိုး ရရှိနိုင်ပါတယ်။",
    badge: "Sale",
  },
  {
    id: "2",
    name: "Leather Crossbody Bag",
    price: 45000,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
    category: "အိတ်",
    description: "အရည်အသွေးမြင့် သားရေဖြင့်ပြုလုပ်ထားသော crossbody bag ဖြစ်ပါတယ်။",
  },
  {
    id: "3",
    name: "White Sneakers",
    price: 38000,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
    category: "ဖိနပ်",
    description: "ခေတ်မီဒီဇိုင်းဖြင့် ပြုလုပ်ထားသော sneaker ဖိနပ်ဖြစ်ပါတယ်။",
    badge: "New",
  },
  {
    id: "4",
    name: "Gold Hoop Earrings",
    price: 12000,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&h=600&fit=crop",
    category: "လက်ဝတ်ရတနာ",
    description: "ရွှေရောင် hoop earrings ဖြစ်ပါတယ်။ နေ့စဉ် ဝတ်ဆင်ရန် သင့်တော်ပါတယ်။",
  },
  {
    id: "5",
    name: "Denim Jacket",
    price: 55000,
    originalPrice: 68000,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=600&fit=crop",
    category: "အဝတ်အထည်",
    description: "Classic denim jacket ဖြစ်ပြီး မည်သည့် outfit နှင့်မဆို လိုက်ဖက်ပါတယ်။",
    badge: "Sale",
  },
  {
    id: "6",
    name: "Canvas Tote Bag",
    price: 18000,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop",
    category: "အိတ်",
    description: "ပြန်လည်အသုံးပြုနိုင်သော canvas tote bag ဖြစ်ပါတယ်။",
    badge: "New",
  },
  {
    id: "7",
    name: "Running Shoes",
    price: 62000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    category: "ဖိနပ်",
    description: "ပေါ့ပါးပြီး သက်တောင့်သက်သာရှိသော running shoes ဖြစ်ပါတယ်။",
  },
  {
    id: "8",
    name: "Silver Chain Necklace",
    price: 25000,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
    category: "လက်ဝတ်ရတနာ",
    description: "ငွေရောင် chain necklace ဖြစ်ပါတယ်။ ဝတ်ဆင်ရလွယ်ကူပါတယ်။",
  },
];
