import { useRef, useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Upload, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Row = {
  name?: string;
  sku?: string | null;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
  stock?: number | string | null;
  sell_price?: number | string | null;
  cost_price?: number | string | null;
};

const toNum = (v: unknown, def = 0): number => {
  if (v === null || v === undefined || v === "") return def;
  const n = Number(String(v).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : def;
};

const normalize = (r: Row) => ({
  name: String(r.name ?? "").trim(),
  sku: r.sku ? String(r.sku).trim() : null,
  category: r.category ? String(r.category).trim() : null,
  description: r.description ? String(r.description) : null,
  image_url: r.image_url ? String(r.image_url) : null,
  stock: Math.max(0, Math.floor(toNum(r.stock, 0))),
  sell_price: toNum(r.sell_price, 0),
  cost_price: toNum(r.cost_price, 0),
});

export default function ProductImportExport({ onImported }: { onImported?: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const exportData = async (format: "json" | "csv") => {
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("name, sku, category, description, image_url, stock, sell_price, cost_price")
        .order("id", { ascending: true });
      if (error) throw error;
      const rows = data || [];
      let blob: Blob;
      let filename: string;
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "json") {
        blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
        filename = `products-backup-${stamp}.json`;
      } else {
        const csv = Papa.unparse(rows);
        blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        filename = `products-backup-${stamp}.csv`;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${rows.length} ပစ္စည်း ထုတ်ယူပြီးပါပြီ`);
    } catch (e: any) {
      toast.error(e?.message || "Export မအောင်မြင်ပါ");
    } finally {
      setBusy(false);
    }
  };

  const parseFile = (file: File): Promise<Row[]> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("ဖိုင်ဖတ်၍ မရပါ"));
      reader.onload = () => {
        const text = String(reader.result || "");
        if (file.name.toLowerCase().endsWith(".json")) {
          try {
            const parsed = JSON.parse(text);
            const arr = Array.isArray(parsed)
              ? parsed
              : Array.isArray((parsed as any).products)
              ? (parsed as any).products
              : null;
            if (!arr) return reject(new Error("JSON ထဲမှာ products array မတွေ့ပါ"));
            resolve(arr as Row[]);
          } catch (e: any) {
            reject(new Error("JSON ဖတ်၍ မရပါ — format မှန်မမှန် စစ်ပါ"));
          }
        } else {
          const res = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });
          if (res.errors.length) {
            reject(new Error(res.errors[0].message));
            return;
          }
          resolve(res.data);
        }
      };
      reader.readAsText(file);
    });

  const importFile = async (file: File) => {
    setBusy(true);
    setProgress(null);
    try {
      const raw = await parseFile(file);
      const rows = raw.map(normalize).filter((r) => r.name);
      if (rows.length === 0) {
        toast.error("မှန်ကန်တဲ့ ပစ္စည်း မတွေ့ပါ — name field လိုအပ်ပါတယ်");
        return;
      }
      // Fetch existing to match by sku then name
      const { data: existing, error: exErr } = await supabase
        .from("products")
        .select("id, name, sku");
      if (exErr) throw exErr;
      const bySku = new Map<string, number>();
      const byName = new Map<string, number>();
      (existing || []).forEach((p: any) => {
        if (p.sku) bySku.set(String(p.sku).trim().toLowerCase(), p.id);
        if (p.name) byName.set(String(p.name).trim().toLowerCase(), p.id);
      });

      const toInsert: any[] = [];
      const toUpdate: { id: number; data: any }[] = [];
      for (const r of rows) {
        const matchId =
          (r.sku && bySku.get(r.sku.toLowerCase())) ||
          byName.get(r.name.toLowerCase());
        if (matchId) toUpdate.push({ id: matchId, data: r });
        else toInsert.push(r);
      }

      setProgress({ done: 0, total: toInsert.length + toUpdate.length });
      let done = 0;

      // Batch insert in chunks of 100
      for (let i = 0; i < toInsert.length; i += 100) {
        const chunk = toInsert.slice(i, i + 100);
        const { error } = await supabase.from("products" as any).insert(chunk);
        if (error) throw error;
        done += chunk.length;
        setProgress({ done, total: toInsert.length + toUpdate.length });
      }

      // Updates one-by-one (different ids)
      for (const u of toUpdate) {
        const { error } = await supabase
          .from("products")
          .update(u.data)
          .eq("id", u.id);
        if (error) throw error;
        done++;
        setProgress({ done, total: toInsert.length + toUpdate.length });
      }

      toast.success(
        `Import ပြီးပါပြီ — အသစ် ${toInsert.length} ခု၊ update ${toUpdate.length} ခု`
      );
      onImported?.();
    } catch (e: any) {
      toast.error(e?.message || "Import မအောင်မြင်ပါ");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileJson className="h-5 w-5 text-primary" /> Backup Import / Export
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          JSON သို့မဟုတ် CSV ဖိုင်ဖြင့် ပစ္စည်းစာရင်း (name, sku, category, stock, sell_price, cost_price, image_url, description) ကို
          တင်သွင်း / ထုတ်ယူနိုင်ပါတယ်။ SKU သို့မဟုတ် နာမည်တူရင် update လုပ်ပါမယ်။
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".json,.csv,application/json,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importFile(f);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Backup ဖိုင် တင်သွင်းမည်
        </Button>
        <Button variant="outline" onClick={() => exportData("json")} disabled={busy}>
          <Download className="h-4 w-4 mr-2" /> JSON ထုတ်ယူ
        </Button>
        <Button variant="outline" onClick={() => exportData("csv")} disabled={busy}>
          <FileSpreadsheet className="h-4 w-4 mr-2" /> CSV ထုတ်ယူ
        </Button>
      </div>

      {progress && (
        <p className="text-xs text-muted-foreground">
          လုပ်ဆောင်နေသည်... {progress.done} / {progress.total}
        </p>
      )}
    </Card>
  );
}
