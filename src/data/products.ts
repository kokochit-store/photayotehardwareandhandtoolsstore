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
  "ဖုန်းအိတ်/ကာဗာ",
  "အားသွင်းကိရိယာ",
  "နားကြပ်",
  "ကေဘယ်/ကြိုး",
  "စခရင်ကာ",
] as const;

export const products: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Silicone Case",
    price: 8500,
    originalPrice: 12000,
    image: "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=600&h=600&fit=crop",
    category: "ဖုန်းအိတ်/ကာဗာ",
    description: "iPhone 15 Pro အတွက် silicone case ဖြစ်ပါတယ်။ အရောင်အမျိုးမျိုး ရရှိနိုင်ပါတယ်။",
    badge: "Sale",
  },
  {
    id: "2",
    name: "65W GaN Fast Charger",
    price: 18000,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=600&fit=crop",
    category: "အားသွင်းကိရိယာ",
    description: "65W GaN fast charger ဖြစ်ပြီး ဖုန်းနှင့် laptop နှစ်ခုလုံး အားသွင်းနိုင်ပါတယ်။",
    badge: "New",
  },
  {
    id: "3",
    name: "TWS Bluetooth Earbuds",
    price: 25000,
    originalPrice: 35000,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop",
    category: "နားကြပ်",
    description: "Noise cancelling ပါဝင်သော wireless earbuds ဖြစ်ပါတယ်။",
    badge: "Sale",
  },
  {
    id: "4",
    name: "USB-C to Lightning Cable (1m)",
    price: 5500,
    image: "https://images.unsplash.com/photo-1589476993333-f55b84301219?w=600&h=600&fit=crop",
    category: "ကေဘယ်/ကြိုး",
    description: "အရည်အသွေးမြင့် USB-C to Lightning cable ဖြစ်ပါတယ်။ 1 မီတာ ရှည်ပါတယ်။",
  },
  {
    id: "5",
    name: "Samsung Galaxy S24 Tempered Glass",
    price: 3500,
    image: "https://images.unsplash.com/photo-1600087626014-e652e18bbff2?w=600&h=600&fit=crop",
    category: "စခရင်ကာ",
    description: "Samsung Galaxy S24 အတွက် 9H tempered glass screen protector ဖြစ်ပါတယ်။",
  },
  {
    id: "6",
    name: "10000mAh Power Bank",
    price: 15000,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop",
    category: "အားသွင်းကိရိယာ",
    description: "ပေါ့ပါးပြီး 10000mAh ပါဝါဘဏ်ဖြစ်ပါတယ်။ Fast charging ပါဝင်ပါတယ်။",
    badge: "New",
  },
  {
    id: "7",
    name: "Over-Ear Wireless Headphone",
    price: 45000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    category: "နားကြပ်",
    description: "Bass မြင့်ပြီး သက်တောင့်သက်သာ ဝတ်ဆင်နိုင်သော wireless headphone ဖြစ်ပါတယ်။",
  },
  {
    id: "8",
    name: "Pixel 8 Clear Case",
    price: 6000,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&fit=crop",
    category: "ဖုန်းအိတ်/ကာဗာ",
    description: "Google Pixel 8 အတွက် transparent clear case ဖြစ်ပါတယ်။",
  },
];
