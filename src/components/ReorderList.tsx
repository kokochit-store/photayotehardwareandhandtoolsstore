import { useEffect, useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Download, FileSpreadsheet, FileJson, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReorderRow {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  stock: number;
  sell_price: number;
  cost_price: number;
  reorder_qty: number;
}

export default function ReorderList() {
  const [rows, setRows] = useState<ReorderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState<number>(5);
  const [defaultQty, setDefaultQty] = useState<number>(10);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, sku, category, stock, sell_price, cost_price")
      .lte("stock", threshold)
      .order("stock", { ascending: true })
      .order("name", { ascending: true });
    if (error) {
      toast.error(error.message);
    } else {
      setRows(
        (data || []).map((p: any) => ({
          ...p,
          reorder_qty: Math.max(defaultQty - (p.stock || 0), defaultQty),
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQty = (id: number, qty: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, reorder_qty: Math.max(0, qty) } : r)));
  };

  const totalCost = rows.reduce((s, r) => s + r.reorder_qty * (r.cost_price || 0), 0);

  const exportFile = (format: "csv" | "json") => {
    if (rows.length === 0) {
      toast.error("စာရင်း ဗလာဖြစ်နေပါသည်");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    const payload = rows.map((r) => ({
      sku: r.sku,
      name: r.name,
      category: r.category,
      current_stock: r.stock,
      reorder_qty: r.reorder_qty,
      cost_price: r.cost_price,
      line_total: r.reorder_qty * (r.cost_price || 0),
    }));
    let blob: Blob;
    let filename: string;
    if (format === "json") {
      blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      filename = `reorder-list-${stamp}.json`;
    } else {
      blob = new Blob([Papa.unparse(payload)], { type: "text/csv;charset=utf-8" });
      filename = `reorder-list-${stamp}.csv`;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${rows.length} ပစ္စည်း ထုတ်ယူပြီးပါပြီ`);
  };

  const outCount = rows.filter((r) => r.stock === 0).length;
  const lowCount = rows.length - outCount;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" /> Reorder List (လက်ကျန်နည်း / ကုန်ဆုံး)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Out of stock <span className="font-semibold text-destructive">{outCount}</span> ခု၊
            လက်ကျန်နည်း <span className="font-semibold">{lowCount}</span> ခု —
            စုစုပေါင်း reorder ကုန်ကျ ခန့်မှန်း{" "}
            <span className="font-semibold">{totalCost.toLocaleString("en-US")} ကျပ်</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Threshold ≤</span>
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Math.max(0, Number(e.target.value) || 0))}
              className="w-20 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Default qty</span>
            <Input
              type="number"
              value={defaultQty}
              onChange={(e) => setDefaultQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 h-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportFile("csv")} disabled={rows.length === 0}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportFile("json")} disabled={rows.length === 0}>
            <FileJson className="h-4 w-4 mr-2" /> JSON
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          🎉 လက်ကျန်နည်းတဲ့ ပစ္စည်း မရှိပါ
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">SKU</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3 text-right">Stock</th>
                <th className="py-2 pr-3 text-right">Cost</th>
                <th className="py-2 pr-3 text-right">Reorder Qty</th>
                <th className="py-2 pr-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="py-2 pr-3 font-mono text-xs">{r.sku || "-"}</td>
                  <td className="py-2 pr-3">{r.name}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.category || "-"}</td>
                  <td className="py-2 pr-3 text-right">
                    <span
                      className={
                        r.stock === 0
                          ? "inline-block px-2 py-0.5 rounded bg-destructive/10 text-destructive font-semibold"
                          : "inline-block px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold"
                      }
                    >
                      {r.stock}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-right">{(r.cost_price || 0).toLocaleString("en-US")}</td>
                  <td className="py-2 pr-3 text-right">
                    <Input
                      type="number"
                      value={r.reorder_qty}
                      onChange={(e) => updateQty(r.id, Number(e.target.value) || 0)}
                      className="w-20 h-8 ml-auto text-right"
                    />
                  </td>
                  <td className="py-2 pr-3 text-right font-medium">
                    {(r.reorder_qty * (r.cost_price || 0)).toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2">
                <td colSpan={6} className="py-2 pr-3 text-right font-semibold">
                  Total (ကျပ်)
                </td>
                <td className="py-2 pr-3 text-right font-bold text-primary">
                  {totalCost.toLocaleString("en-US")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}
