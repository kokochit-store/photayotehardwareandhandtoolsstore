import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, RefreshCw, Loader2, FileSpreadsheet, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

interface Sale {
  id: string;
  total: number;
  item_count: number;
  note: string | null;
  created_at: string;
}

const fmt = (n: number) => `${Math.round(n).toLocaleString("en-US")} ကျပ်`;

type Period = "day" | "month" | "year";

export default function SalesReports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<Period>("day");
  const [days, setDays] = useState(30);

  const load = async () => {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data, error } = await supabase
      .from("sales")
      .select("id,total,item_count,note,created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setSales(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const grouped = useMemo(() => {
    const map = new Map<string, { key: string; total: number; count: number; items: number }>();
    for (const s of sales) {
      const d = new Date(s.created_at);
      let key = "";
      if (period === "day") key = d.toISOString().slice(0, 10);
      else if (period === "month") key = d.toISOString().slice(0, 7);
      else key = String(d.getFullYear());
      const cur = map.get(key) || { key, total: 0, count: 0, items: 0 };
      cur.total += Number(s.total) || 0;
      cur.count += 1;
      cur.items += s.item_count || 0;
      map.set(key, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [sales, period]);

  const totals = useMemo(() => {
    return grouped.reduce(
      (acc, g) => ({ total: acc.total + g.total, count: acc.count + g.count, items: acc.items + g.items }),
      { total: 0, count: 0, items: 0 },
    );
  }, [grouped]);

  const exportCsv = () => {
    if (grouped.length === 0) return toast.error("စာရင်း ဗလာဖြစ်နေပါသည်");
    const rows = grouped.map((g) => ({
      period: g.key,
      receipts: g.count,
      items_sold: g.items,
      total_sales: Math.round(g.total),
    }));
    const blob = new Blob([Papa.unparse(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteSale = async (id: string) => {
    if (!confirm("ဒီရောင်းလက်မှတ်ကို ဖျက်မှာသေချာလား?")) return;
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      setSales((prev) => prev.filter((s) => s.id !== id));
      toast.success("ဖျက်ပြီးပါပြီ");
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> ရောင်းအား စာရင်း (နေ့စဉ်/လစဉ်/နှစ်ချုပ်)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            စုစုပေါင်း {totals.count} လက်မှတ် — {totals.items} ပစ္စည်း —{" "}
            <span className="font-semibold text-primary">{fmt(totals.total)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-md border overflow-hidden">
            {(["day", "month", "year"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 h-9 text-sm ${period === p ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
              >
                {p === "day" ? "နေ့စဉ်" : p === "month" ? "လစဉ်" : "နှစ်ချုပ်"}
              </button>
            ))}
          </div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-input rounded-md bg-background px-3 h-9 text-sm"
          >
            <option value={7}>လွန်ခဲ့ 7 ရက်</option>
            <option value={30}>လွန်ခဲ့ 30 ရက်</option>
            <option value={90}>လွန်ခဲ့ 90 ရက်</option>
            <option value={365}>လွန်ခဲ့ 1 နှစ်</option>
            <option value={1825}>လွန်ခဲ့ 5 နှစ်</option>
          </select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={grouped.length === 0}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
      ) : grouped.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
          ရောင်းအား မှတ်တမ်း မရှိသေးပါ
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">အချိန်</th>
                <th className="py-2 pr-3 text-right">လက်မှတ်</th>
                <th className="py-2 pr-3 text-right">ပစ္စည်း</th>
                <th className="py-2 pr-3 text-right">စုစုပေါင်း</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((g) => (
                <tr key={g.key} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="py-2 pr-3 font-mono">{g.key}</td>
                  <td className="py-2 pr-3 text-right">{g.count}</td>
                  <td className="py-2 pr-3 text-right">{g.items}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{fmt(g.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2">
                <td className="py-2 pr-3 font-semibold">Total</td>
                <td className="py-2 pr-3 text-right font-semibold">{totals.count}</td>
                <td className="py-2 pr-3 text-right font-semibold">{totals.items}</td>
                <td className="py-2 pr-3 text-right font-bold text-primary">{fmt(totals.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {sales.length > 0 && (
        <details className="pt-2">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            နောက်ဆုံး လက်မှတ်များ ({sales.length})
          </summary>
          <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
            {sales.slice(0, 100).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-muted/40">
                <span className="font-mono text-muted-foreground">
                  {new Date(s.created_at).toLocaleString("en-GB")}
                </span>
                <span>{s.item_count} ခု</span>
                <span className="font-semibold">{fmt(Number(s.total))}</span>
                <button onClick={() => deleteSale(s.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </Card>
  );
}
