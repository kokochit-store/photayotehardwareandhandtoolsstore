import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import ProductImportExport from "@/components/ProductImportExport";
import { Loader2, Sparkles, LogOut, Image as ImageIcon, RefreshCw, Square, Upload, Tag, Minus, Plus, Pencil, Save, X } from "lucide-react";

interface DbProduct {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  image_url: string | null;
  sell_price: number;
  stock: number;
}

const PAGE_LIMIT = 50;

const formatPrice = (n: number) => `${n.toLocaleString("en-US")} ကျပ်`;

const Admin = () => {
  const { signOut, user } = useAuth();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "missing" | "has">("missing");
  const [generating, setGenerating] = useState<Set<number>>(new Set());
  const [uploading, setUploading] = useState<Set<number>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const stopRef = useRef(false);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  const [pctValue, setPctValue] = useState<string>("");
  const [pctModalOpen, setPctModalOpen] = useState(false);
  const [pctPreview, setPctPreview] = useState<DbProduct[]>([]);

  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editStock, setEditStock] = useState<string>("");
  const [editCategory, setEditCategory] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    let q = supabase
      .from("products")
      .select("id, name, sku, category, image_url, sell_price, stock")
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

  type GenerateResult = "success" | "failed" | "rate_limited" | "credits_exhausted";

  const generateOne = async (product: DbProduct, retries = 3): Promise<GenerateResult> => {
    setGenerating((prev) => new Set(prev).add(product.id));
    try {
      for (let attempt = 0; attempt < retries; attempt++) {
        const { data, error } = await supabase.functions.invoke("generate-product-image", {
          body: { productId: product.id, productName: product.name, category: product.category },
        });

        const httpStatus = (error as any)?.context?.status;
        const code = data?.code as string | undefined;
        const isRateLimit =
          httpStatus === 429 ||
          code === "RATE_LIMIT" ||
          /429|rate limit/i.test(error?.message || "") ||
          /rate limit/i.test(data?.error || "");
        const isCreditsExhausted =
          httpStatus === 402 ||
          code === "INSUFFICIENT_CREDITS" ||
          Boolean(data?.stop) ||
          /insufficient credits/i.test(error?.message || "") ||
          /insufficient credits/i.test(data?.error || "");

        if (isCreditsExhausted) {
          toast.error("AI credits မလုံလောက်တော့ပါ — Workspace Usage မှာ top up လုပ်ရန်လိုပါတယ်");
          return "credits_exhausted";
        }

        if (isRateLimit) {
          const wait = data?.retry_after_ms ?? 15000;
          if (attempt < retries - 1) {
            await new Promise((r) => setTimeout(r, wait));
            continue;
          }
          toast.error(`${product.name}: ခဏနေပြီး ထပ်စမ်းပါ`);
          return "rate_limited";
        }

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        if (data?.image_url) {
          setProducts((prev) =>
            prev.map((p) => (p.id === product.id ? { ...p, image_url: data.image_url } : p))
          );
          return "success";
        }
        return "failed";
      }
      return "failed";
    } catch (err: any) {
      const msg = err?.message || "ပုံ ဖန်တီးခြင်း မအောင်မြင်ပါ";
      toast.error(`${product.name}: ${msg}`);
      return "failed";
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleSingle = async (product: DbProduct) => {
    const result = await generateOne(product);
    if (result === "success") toast.success(`${product.name} — ပုံ ပြီးပါပြီ`);
  };

  const handleBulk = async () => {
    if (products.length === 0) return;
    stopRef.current = false;
    setBulkRunning(true);
    setProgress({ done: 0, total: products.length });
    let done = 0;
    let creditsExhausted = false;

    for (const p of products) {
      if (stopRef.current) break;
      const result = await generateOne(p);
      if (result === "credits_exhausted") {
        creditsExhausted = true;
        break;
      }
      done++;
      setProgress({ done, total: products.length });
      await new Promise((r) => setTimeout(r, 12000));
    }

    setBulkRunning(false);
    if (creditsExhausted) {
      toast.error("Bulk generation ရပ်ထားပါတယ် — AI credits ကုန်နေပါတယ်");
      return;
    }
    if (stopRef.current) {
      toast.info(`ရပ်ဆိုင်းထားပါတယ် — ${done}/${products.length}`);
      return;
    }
    toast.success(`အသုတ်လိုက် ပြီးပါပြီ — ${done}/${products.length}`);
  };

  const stopBulk = () => {
    stopRef.current = true;
    toast.info("ရပ်ဆိုင်းနေပါသည်...");
  };

  const handleUpload = async (product: DbProduct, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("ပုံဖိုင်သာ ရွေးပါ");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ဖိုင်အရွယ် 5MB ထက် မပိုရပါ");
      return;
    }
    setUploading((prev) => new Set(prev).add(product.id));
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `products/${product.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const url = pub.publicUrl;
      const { error: updErr } = await supabase
        .from("products")
        .update({ image_url: url })
        .eq("id", product.id);
      if (updErr) throw updErr;
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, image_url: url } : p))
      );
      toast.success(`${product.name} — ပုံ တင်ပြီးပါပြီ`);
    } catch (err: any) {
      toast.error(`${product.name}: ${err?.message || "တင်၍ မရပါ"}`);
    } finally {
      setUploading((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  // ====== Price / Stock inline editing ======
  const startEdit = (p: DbProduct) => {
    setEditId(p.id);
    setEditName(p.name);
    setEditSku(p.sku || "");
    setEditPrice(String(p.sell_price));
    setEditStock(String(p.stock));
    setEditCategory(p.category || "");
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const saveEdit = async (id: number) => {
    const price = Number(editPrice);
    const stock = Number(editStock);
    if (isNaN(price) || price < 0) {
      toast.error("ဈေးနှုန်း အမှန်ရိုက်ထည့်ပါ");
      return;
    }
    if (isNaN(stock) || stock < 0) {
      toast.error("လက်ကျန် အမှန်ရိုက်ထည့်ပါ");
      return;
    }
    const { error } = await supabase
      .from("products")
      .update({ name: editName, sku: editSku || null, category: editCategory || null, sell_price: price, stock })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: editName, sku: editSku || null, category: editCategory || null, sell_price: price, stock } : p))
    );
    setEditId(null);
    toast.success("ဈေးနှုန်းနှင့် ပစ္စည်းအချက်အလက် ပြင်ဆင်ပြီးပါပြီ");
  };

  // ====== Bulk percentage price change ======
  const openPctPreview = () => {
    const pct = Number(pctValue);
    if (isNaN(pct) || pct === 0) {
      toast.error("% အမှန်ရိုက်ထည့်ပါ");
      return;
    }
    const factor = 1 + pct / 100;
    const preview = products.map((p) => ({
      ...p,
      sell_price: Math.round(p.sell_price * factor),
    }));
    setPctPreview(preview);
    setPctModalOpen(true);
  };

  const applyPctChange = async () => {
    const pct = Number(pctValue);
    if (isNaN(pct)) return;
    const factor = 1 + pct / 100;
    setLoading(true);
    const updates = products.map(async (p) => {
      const newPrice = Math.round(p.sell_price * factor);
      const { error } = await supabase
        .from("products")
        .update({ sell_price: newPrice })
        .eq("id", p.id);
      return { id: p.id, newPrice, error };
    });
    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      toast.error(`${errors.length} ခု မအောင်မြင်ပါ`);
    } else {
      toast.success("ဈေးနှုန်း အကုန်ပြောင်းပြီးပါပြီ");
    }
    setPctModalOpen(false);
    setPctValue("");
    await loadProducts();
    setLoading(false);
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
        <ProductImportExport onImported={loadProducts} />

        {/* Price Manager */}
        <Card className="p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" /> ဈေးနှုန်း လွယ်ကူစီမံရန်
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              % (ရာနှုန်းအလိုက်) သို့မဟုတ် တစ်ခုချင်း စိတ်တိုင်းကျ ပြင်ဆင်နိုင်ပါသည်။
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPctValue((v) => String((Number(v) || 0) - 5))}>
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                placeholder="% ဈေးနှုန်း ပြောင်းရန်"
                className="w-36"
                value={pctValue}
                onChange={(e) => setPctValue(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={() => setPctValue((v) => String((Number(v) || 0) + 5))}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button onClick={openPctPreview} disabled={products.length === 0}>
              % အလိုက် အကုန်ပြောင်းမည်
            </Button>
            <p className="text-xs text-muted-foreground">
              +10 မှာတော့ ဈေးကို 10% တိုးမည်၊ -10 မှာတော့ 10% လျှော့မည်။
            </p>
          </div>
        </Card>

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
              const isUploading = uploading.has(p.id);
              const busy = isGenerating || isUploading;
              const isEditing = editId === p.id;

              return (
                <Card key={p.id} className="overflow-hidden">
                  <div className="aspect-square bg-secondary relative flex items-center justify-center">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                    )}
                    {busy && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-muted-foreground truncate">{p.category || "—"}</p>

                    {isEditing ? (
                      <div className="space-y-2">
                        <Input size={1} className="text-xs" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="အမည်" />
                        <Input size={1} className="text-xs" value={editSku} onChange={(e) => setEditSku(e.target.value)} placeholder="SKU" />
                        <Input size={1} className="text-xs" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="အမျိုးအစား" />
                        <div className="flex gap-2">
                          <Input size={1} type="number" className="text-xs" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="ဈေးနှုန်း" />
                          <Input size={1} type="number" className="text-xs" value={editStock} onChange={(e) => setEditStock(e.target.value)} placeholder="လက်ကျန်" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" className="flex-1" onClick={() => saveEdit(p.id)}>
                            <Save className="h-3.5 w-3.5 mr-1" /> သိမ်းမည်
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-primary font-semibold">{formatPrice(p.sell_price)}</span>
                          <span className="text-muted-foreground">{p.stock} လက်ကျန်</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => startEdit(p)}
                          disabled={busy || bulkRunning}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          ပြင်ဆင်မည်
                        </Button>
                        <Button
                          size="sm"
                          variant={p.image_url ? "outline" : "default"}
                          className="w-full"
                          onClick={() => handleSingle(p)}
                          disabled={busy || bulkRunning}
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                          {p.image_url ? "AI ပြန်ဖန်တီးမည်" : "AI ဖြင့် ဖန်တီးမည်"}
                        </Button>
                        <input
                          ref={(el) => (fileInputs.current[p.id] = el)}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUpload(p, f);
                            e.target.value = "";
                          }}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          onClick={() => fileInputs.current[p.id]?.click()}
                          disabled={busy || bulkRunning}
                        >
                          <Upload className="h-3.5 w-3.5 mr-1.5" />
                          ကိုယ်တိုင် ပုံတင်မည်
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Percentage change confirmation dialog */}
      <Dialog open={pctModalOpen} onOpenChange={setPctModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>ဈေးနှုန်း ပြောင်းလဲမှု အတည်ပြုရန်</DialogTitle>
            <DialogDescription>
              {Number(pctValue) > 0
                ? `ဈေးနှုန်းအားလုံး ${Number(pctValue)}% တိုးမည်`
                : `ဈေးနှုန်းအားလုံး ${Math.abs(Number(pctValue))}% လျှော့မည်`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-auto space-y-2">
            {pctPreview.map((pp) => {
              const orig = products.find((x) => x.id === pp.id);
              return (
                <div key={pp.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <span className="truncate max-w-[50%]">{pp.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground line-through">{orig ? formatPrice(orig.sell_price) : "—"}</span>
                    <span className="text-primary font-semibold">{formatPrice(pp.sell_price)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPctModalOpen(false)}>
              မလုပ်ပါ
            </Button>
            <Button onClick={applyPctChange}>အတည်ပြုပြီး ပြောင်းမည်</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Admin;
