import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, LogOut, Image as ImageIcon, RefreshCw, Square } from "lucide-react";
import { toast } from "sonner";

interface DbProduct {
  id: number;
  name: string;
  category: string | null;
  image_url: string | null;
}

const PAGE_LIMIT = 50;

const Admin = () => {
  const { signOut, user } = useAuth();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "missing" | "has">("missing");
  const [generating, setGenerating] = useState<Set<number>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const stopRef = useRef(false);

  const loadProducts = async () => {
    setLoading(true);
    let q = supabase
      .from("products")
      .select("id, name, category, image_url")
      .order("stock", { ascending: false })
      .limit(PAGE_LIMIT);
    if (filter === "missing") q = q.is("image_url", null);
    if (filter === "has") q = q.not("image_url", "is", null);
    if (search.trim()) q = q.ilike("name", `%${search.trim()}%`);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const generateOne = async (product: DbProduct): Promise<boolean> => {
    setGenerating((prev) => new Set(prev).add(product.id));
    try {
      const { data, error } = await supabase.functions.invoke("generate-product-image", {
        body: { productId: product.id, productName: product.name, category: product.category },
      });
      if (error) throw error;
      if (data?.image_url) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, image_url: data.image_url } : p))
        );
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err?.message || "ပုံ ဖန်တီးခြင်း မအောင်မြင်ပါ";
      toast.error(`${product.name}: ${msg}`);
      return false;
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleSingle = async (product: DbProduct) => {
    const ok = await generateOne(product);
    if (ok) toast.success(`${product.name} — ပုံ ပြီးပါပြီ`);
  };

  const handleBulk = async () => {
    if (products.length === 0) return;
    stopRef.current = false;
    setBulkRunning(true);
    setProgress({ done: 0, total: products.length });
    let done = 0;
    for (const p of products) {
      if (stopRef.current) break;
      await generateOne(p);
      done++;
      setProgress({ done, total: products.length });
      // small delay to respect rate limits
      await new Promise((r) => setTimeout(r, 800));
    }
    setBulkRunning(false);
    toast.success(`အသုတ်လိုက် ပြီးပါပြီ — ${done}/${products.length}`);
  };

  const stopBulk = () => {
    stopRef.current = true;
    toast.info("ရပ်ဆိုင်းနေပါသည်...");
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> ထွက်မည်
          </Button>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8 space-y-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> AI ဖြင့် ပစ္စည်းပုံ ဖန်တီးခြင်း
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                ပစ္စည်းအမည်ကိုကြည့်ပြီး AI က ပုံကို အလိုအလျောက် ဖန်တီးပေးပါမယ်။
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Input
              placeholder="ပစ္စည်းအမည်နဲ့ ရှာရန်..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadProducts()}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-input rounded-md bg-background px-3 text-sm"
            >
              <option value="missing">ပုံမရှိသေးတဲ့ ပစ္စည်းများ</option>
              <option value="has">ပုံရှိပြီးသား ပစ္စည်းများ</option>
              <option value="all">အားလုံး</option>
            </select>
            <Button variant="outline" onClick={loadProducts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              ရှာ / ပြန်ဖွင့်
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {!bulkRunning ? (
              <Button onClick={handleBulk} disabled={products.length === 0 || loading}>
                <Sparkles className="h-4 w-4 mr-2" />
                အကုန် ({products.length}) တစ်ပြိုင်နက် ဖန်တီးရန်
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopBulk}>
                <Square className="h-4 w-4 mr-2" /> ရပ်မည်
              </Button>
            )}
            {bulkRunning && (
              <div className="flex-1 min-w-[200px]">
                <Progress value={(progress.done / Math.max(1, progress.total)) * 100} />
                <p className="text-xs text-muted-foreground mt-1">
                  {progress.done} / {progress.total}
                </p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            တစ်ကြိမ်တည်း အများဆုံး {PAGE_LIMIT} ခု ပြသပါတယ်။ နောက်ထပ် ပုံစုံအတွက် ရှာဖွေရန် သို့မဟုတ် filter ပြောင်းပြီး ထပ်လုပ်ပါ။
          </p>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            ပစ္စည်း မတွေ့ပါ
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => {
              const isGenerating = generating.has(p.id);
              return (
                <Card key={p.id} className="overflow-hidden">
                  <div className="aspect-square bg-secondary relative flex items-center justify-center">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                    )}
                    {isGenerating && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-muted-foreground truncate">{p.category || "—"}</p>
                    <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                    <Button
                      size="sm"
                      variant={p.image_url ? "outline" : "default"}
                      className="w-full"
                      onClick={() => handleSingle(p)}
                      disabled={isGenerating || bulkRunning}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      {p.image_url ? "ပြန်ဖန်တီးမည်" : "ပုံ ဖန်တီးမည်"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Admin;
