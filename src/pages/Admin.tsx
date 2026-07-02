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
import { Loader2, Sparkles, LogOut, Image as ImageIcon, RefreshCw, Square, Upload, Tag, Minus, Plus, Pencil, Save, X, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";

interface DbProduct {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  image_url: string | null;
  sell_price: number;
  stock: number;
}

const PAGE_SIZE = 24;

const formatPrice = (n: number) => `${n.toLocaleString("en-US")} ကျပ်`;

// Convert any image (heic/webp/avif/gif/bmp/svg/png/jpeg/...) to JPEG via canvas.
// Falls back to original file if conversion isn't possible in browser.
async function normalizeImage(file: File): Promise<{ blob: Blob; ext: string; contentType: string }> {
  // If already jpeg/png/webp and small enough, just pass-through but standardize ext.
  const passThrough = ["image/jpeg", "image/png", "image/webp"];
  const tryDirect = passThrough.includes(file.type);

  try {
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (bitmap) {
      const maxDim = 1600;
      let { width, height } = bitmap;
      if (width > maxDim || height > maxDim) {
        const r = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0, width, height);
        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob((b) => res(b), "image/jpeg", 0.88)
        );
        if (blob) return { blob, ext: "jpg", contentType: "image/jpeg" };
      }
    }
  } catch {
    // ignore, fall back
  }

  if (tryDirect) {
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    return { blob: file, ext, contentType: file.type };
  }
  // Last resort: upload as-is with generic name
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  return { blob: file, ext, contentType: file.type || "application/octet-stream" };
}

const Admin = () => {
  const { signOut, user } = useAuth();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "missing" | "has">("all");
  const [generating, setGenerating] = useState<Set<number>>(new Set());
  const [uploading, setUploading] = useState<Set<number>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const stopRef = useRef(false);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  const [pctValue, setPctValue] = useState<string>("");
  const [pctScope, setPctScope] = useState<"page" | "all">("all");
  const [pctModalOpen, setPctModalOpen] = useState(false);
  const [pctPreview, setPctPreview] = useState<DbProduct[]>([]);
  const [pctApplying, setPctApplying] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editStock, setEditStock] = useState<string>("");
  const [editCategory, setEditCategory] = useState("");

  // Add new product
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const resetNew = () => {
    setNewName(""); setNewSku(""); setNewCategory("");
    setNewPrice(""); setNewCost(""); setNewStock(""); setNewDescription("");
  };

  const addProduct = async () => {
    if (!newName.trim()) { toast.error("အမည် ရိုက်ထည့်ပါ"); return; }
    const price = Number(newPrice) || 0;
    const cost = Number(newCost) || 0;
    const stock = Number(newStock) || 0;
    if (price < 0 || cost < 0 || stock < 0) { toast.error("ကိန်းဂဏန်း အမှန်ရိုက်ထည့်ပါ"); return; }
    setAddSaving(true);
    try {
      // Compute next id (products.id has no default sequence)
      const { data: maxRow, error: maxErr } = await supabase
        .from("products")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (maxErr) throw maxErr;
      const nextId = ((maxRow?.id as number) || 0) + 1;
      const { error } = await supabase.from("products").insert({
        id: nextId,
        name: newName.trim(),
        sku: newSku.trim() || null,
        category: newCategory.trim() || null,
        description: newDescription.trim() || null,
        sell_price: price,
        cost_price: cost,
        stock,
      });
      if (error) throw error;
      toast.success("ပစ္စည်းအသစ် ထည့်ပြီးပါပြီ");
      setAddOpen(false);
      resetNew();
      await loadProducts(1);
    } catch (e: any) {
      toast.error(e?.message || "ထည့်၍ မရပါ");
    } finally {
      setAddSaving(false);
    }
  };

  const buildQuery = (forCount = false) => {
    let q = supabase
      .from("products")
      .select("id, name, sku, category, image_url, sell_price, stock", forCount ? { count: "exact", head: false } : undefined)
      .order("stock", { ascending: false })
      .order("name", { ascending: true });
    if (filter === "missing") q = q.is("image_url", null);
    if (filter === "has") q = q.not("image_url", "is", null);
    if (search.trim()) q = q.or(`name.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%`);
    return q;
  };

  const loadProducts = async (goToPage = page) => {
    setLoading(true);
    const from = (goToPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error, count } = await buildQuery(true).range(from, to);
    if (error) toast.error(error.message);
    else {
      setProducts(data || []);
      setTotalCount(count ?? 0);
      setPage(goToPage);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
          httpStatus === 429 || code === "RATE_LIMIT" ||
          /429|rate limit/i.test(error?.message || "") || /rate limit/i.test(data?.error || "");
        const isCreditsExhausted =
          httpStatus === 402 || code === "INSUFFICIENT_CREDITS" || Boolean(data?.stop) ||
          /insufficient credits/i.test(error?.message || "") || /insufficient credits/i.test(data?.error || "");

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
          setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, image_url: data.image_url } : p)));
          return "success";
        }
        return "failed";
      }
      return "failed";
    } catch (err: any) {
      toast.error(`${product.name}: ${err?.message || "ပုံ ဖန်တီးခြင်း မအောင်မြင်ပါ"}`);
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
      if (result === "credits_exhausted") { creditsExhausted = true; break; }
      done++;
      setProgress({ done, total: products.length });
      await new Promise((r) => setTimeout(r, 12000));
    }
    setBulkRunning(false);
    if (creditsExhausted) { toast.error("Bulk generation ရပ်ထားပါတယ် — AI credits ကုန်နေပါတယ်"); return; }
    if (stopRef.current) { toast.info(`ရပ်ဆိုင်းထားပါတယ် — ${done}/${products.length}`); return; }
    toast.success(`အသုတ်လိုက် ပြီးပါပြီ — ${done}/${products.length}`);
  };

  const stopBulk = () => { stopRef.current = true; toast.info("ရပ်ဆိုင်းနေပါသည်..."); };

  const handleUpload = async (product: DbProduct, file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("ဖိုင်အရွယ် 20MB ထက် မပိုရပါ");
      return;
    }
    setUploading((prev) => new Set(prev).add(product.id));
    try {
      const { blob, ext, contentType } = await normalizeImage(file);
      const path = `products/${product.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, blob, { cacheControl: "3600", upsert: true, contentType });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const url = `${pub.publicUrl}?t=${Date.now()}`;
      const { error: updErr } = await supabase.from("products").update({ image_url: url }).eq("id", product.id);
      if (updErr) throw updErr;
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, image_url: url } : p)));
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

  // ====== inline editing ======
  const startEdit = (p: DbProduct) => {
    setEditId(p.id);
    setEditName(p.name);
    setEditSku(p.sku || "");
    setEditPrice(String(p.sell_price));
    setEditStock(String(p.stock));
    setEditCategory(p.category || "");
  };
  const cancelEdit = () => setEditId(null);
  const saveEdit = async (id: number) => {
    const price = Number(editPrice);
    const stock = Number(editStock);
    if (isNaN(price) || price < 0) { toast.error("ဈေးနှုန်း အမှန်ရိုက်ထည့်ပါ"); return; }
    if (isNaN(stock) || stock < 0) { toast.error("လက်ကျန် အမှန်ရိုက်ထည့်ပါ"); return; }
    const { error } = await supabase
      .from("products")
      .update({ name: editName, sku: editSku || null, category: editCategory || null, sell_price: price, stock })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, name: editName, sku: editSku || null, category: editCategory || null, sell_price: price, stock } : p)));
    setEditId(null);
    toast.success("ပြင်ဆင်ပြီးပါပြီ");
  };

  // ====== Bulk % change ======
  const openPctPreview = async () => {
    const pct = Number(pctValue);
    if (isNaN(pct) || pct === 0) { toast.error("% အမှန်ရိုက်ထည့်ပါ"); return; }
    const factor = 1 + pct / 100;
    let source: DbProduct[] = [];
    if (pctScope === "page") {
      source = products;
    } else {
      const { data, error } = await buildQuery(false);
      if (error) { toast.error(error.message); return; }
      source = (data as DbProduct[]) || [];
    }
    setPctPreview(source.map((p) => ({ ...p, sell_price: Math.round(p.sell_price * factor) })));
    setPctModalOpen(true);
  };

  const applyPctChange = async () => {
    setPctApplying(true);
    try {
      // Batch updates per id (Supabase doesn't support bulk update with different values cleanly)
      const chunks: DbProduct[][] = [];
      const SIZE = 20;
      for (let i = 0; i < pctPreview.length; i += SIZE) chunks.push(pctPreview.slice(i, i + SIZE));
      let failed = 0;
      for (const chunk of chunks) {
        const results = await Promise.all(
          chunk.map((p) => supabase.from("products").update({ sell_price: p.sell_price }).eq("id", p.id))
        );
        failed += results.filter((r) => r.error).length;
      }
      if (failed > 0) toast.error(`${failed} ခု မအောင်မြင်ပါ`);
      else toast.success(`ဈေးနှုန်း ${pctPreview.length} ခု ပြောင်းပြီးပါပြီ`);
      setPctModalOpen(false);
      setPctValue("");
      await loadProducts(page);
    } finally {
      setPctApplying(false);
    }
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
        <ProductImportExport onImported={() => loadProducts(1)} />

        {/* Price Manager */}
        <Card className="p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" /> ဈေးနှုန်း လွယ်ကူစီမံရန်
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              % အလိုက် (ပစ္စည်းအားလုံး သို့မဟုတ် ဒီစာမျက်နှာသာ) ပြောင်းနိုင်ပါသည်။
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPctValue((v) => String((Number(v) || 0) - 5))}>
                <Minus className="h-3 w-3" />
              </Button>
              <Input type="number" placeholder="%" className="w-28" value={pctValue} onChange={(e) => setPctValue(e.target.value)} />
              <Button variant="outline" size="sm" onClick={() => setPctValue((v) => String((Number(v) || 0) + 5))}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <select
              value={pctScope}
              onChange={(e) => setPctScope(e.target.value as any)}
              className="border border-input rounded-md bg-background px-3 h-10 text-sm"
            >
              <option value="all">ပစ္စည်းအားလုံး ({totalCount})</option>
              <option value="page">ဒီစာမျက်နှာသာ ({products.length})</option>
            </select>
            <Button onClick={openPctPreview}>% အလိုက် ပြောင်းမည်</Button>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> ပစ္စည်းများ စီမံခြင်း
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                ပစ္စည်းအားလုံး ({totalCount}) ကို စာမျက်နှာတိုင်းမှ ပြင်ဆင်/ပုံတင် နိုင်ပါသည်။
              </p>
            </div>
            <Button onClick={() => { resetNew(); setAddOpen(true); }}>
              <PlusCircle className="h-4 w-4 mr-2" /> ပစ္စည်းအသစ် ထည့်မည်
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Input
              placeholder="အမည် / SKU ဖြင့် ရှာရန်..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadProducts(1)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-input rounded-md bg-background px-3 text-sm h-10"
            >
              <option value="all">အားလုံး</option>
              <option value="missing">ပုံမရှိသေး</option>
              <option value="has">ပုံရှိပြီး</option>
            </select>
            <Button variant="outline" onClick={() => loadProducts(1)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              ရှာ / ပြန်ဖွင့်
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {!bulkRunning ? (
              <Button onClick={handleBulk} disabled={products.length === 0 || loading}>
                <Sparkles className="h-4 w-4 mr-2" />
                ဒီစာမျက်နှာက ({products.length}) ကို AI ဖြင့် ဖန်တီးမည်
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopBulk}>
                <Square className="h-4 w-4 mr-2" /> ရပ်မည်
              </Button>
            )}
            {bulkRunning && (
              <div className="flex-1 min-w-[200px]">
                <Progress value={(progress.done / Math.max(1, progress.total)) * 100} />
                <p className="text-xs text-muted-foreground mt-1">{progress.done} / {progress.total}</p>
              </div>
            )}
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">ပစ္စည်း မတွေ့ပါ</Card>
        ) : (
          <>
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
                          <Input className="text-xs h-8" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="အမည်" />
                          <Input className="text-xs h-8" value={editSku} onChange={(e) => setEditSku(e.target.value)} placeholder="SKU" />
                          <Input className="text-xs h-8" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="အမျိုးအစား" />
                          <div className="flex gap-2">
                            <Input type="number" className="text-xs h-8" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="ဈေး" />
                            <Input type="number" className="text-xs h-8" value={editStock} onChange={(e) => setEditStock(e.target.value)} placeholder="လက်ကျန်" />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1" onClick={() => saveEdit(p.id)}>
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
                          <Button size="sm" variant="outline" className="w-full" onClick={() => startEdit(p)} disabled={busy || bulkRunning}>
                            <Pencil className="h-3.5 w-3.5 mr-1.5" /> ပြင်ဆင်မည်
                          </Button>
                          <Button size="sm" variant={p.image_url ? "outline" : "default"} className="w-full" onClick={() => handleSingle(p)} disabled={busy || bulkRunning}>
                            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                            {p.image_url ? "AI ပြန်ဖန်တီးမည်" : "AI ဖြင့် ဖန်တီးမည်"}
                          </Button>
                          <input
                            ref={(el) => (fileInputs.current[p.id] = el)}
                            type="file"
                            accept="image/*,.heic,.heif,.avif"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUpload(p, f);
                              e.target.value = "";
                            }}
                          />
                          <Button size="sm" variant="secondary" className="w-full" onClick={() => fileInputs.current[p.id]?.click()} disabled={busy || bulkRunning}>
                            <Upload className="h-3.5 w-3.5 mr-1.5" /> ကိုယ်တိုင် ပုံတင်မည်
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-sm text-muted-foreground">
                စာမျက်နှာ {page} / {totalPages} — စုစုပေါင်း {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => loadProducts(page - 1)}>
                  <ChevronLeft className="h-4 w-4" /> ရှေ့
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => loadProducts(page + 1)}>
                  နောက် <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Percentage change confirmation dialog */}
      <Dialog open={pctModalOpen} onOpenChange={setPctModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>ဈေးနှုန်း ပြောင်းလဲမှု အတည်ပြုရန်</DialogTitle>
            <DialogDescription>
              {Number(pctValue) > 0
                ? `${pctPreview.length} ခုကို ${Number(pctValue)}% တိုးမည်`
                : `${pctPreview.length} ခုကို ${Math.abs(Number(pctValue))}% လျှော့မည်`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-auto space-y-2">
            {pctPreview.slice(0, 100).map((pp) => (
              <div key={pp.id} className="flex items-center justify-between text-sm border-b pb-2">
                <span className="truncate max-w-[50%]">{pp.name}</span>
                <span className="text-primary font-semibold">{formatPrice(pp.sell_price)}</span>
              </div>
            ))}
            {pctPreview.length > 100 && (
              <p className="text-xs text-muted-foreground">…နှင့် {pctPreview.length - 100} ခု ထပ်ရှိသည်</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPctModalOpen(false)} disabled={pctApplying}>မလုပ်ပါ</Button>
            <Button onClick={applyPctChange} disabled={pctApplying}>
              {pctApplying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              အတည်ပြုပြီး ပြောင်းမည်
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add new product dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => { if (!addSaving) setAddOpen(v); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>ပစ္စည်းအသစ် ထည့်ရန်</DialogTitle>
            <DialogDescription>အောက်ပါအချက်အလက်များကို ဖြည့်ပါ။ ပုံကို ထည့်ပြီးမှ AI ဖြင့် သို့မဟုတ် ကိုယ်တိုင် တင်နိုင်ပါသည်။</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="အမည် *" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="SKU / ကုဒ်" value={newSku} onChange={(e) => setNewSku(e.target.value)} />
              <Input placeholder="အမျိုးအစား" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input type="number" placeholder="ရောင်းဈေး" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
              <Input type="number" placeholder="ဝယ်ဈေး" value={newCost} onChange={(e) => setNewCost(e.target.value)} />
              <Input type="number" placeholder="လက်ကျန်" value={newStock} onChange={(e) => setNewStock(e.target.value)} />
            </div>
            <Input placeholder="ဖော်ပြချက် (ရွေးချယ်)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addSaving}>မလုပ်ပါ</Button>
            <Button onClick={addProduct} disabled={addSaving}>
              {addSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              ထည့်မည်
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Admin;
