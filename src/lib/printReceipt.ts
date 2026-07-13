export type PaperSize = "58mm" | "80mm" | "A4";

export interface ReceiptSettings {
  shopName: string;
  address: string;
  phone: string;
  footer: string;
  paper: PaperSize;
  currency: string;
}

const KEY = "pyy_receipt_settings_v1";

export const defaultSettings: ReceiptSettings = {
  shopName: "ဖိုးတရုတ် စက်အပိုပစ္စည်း",
  address: "",
  phone: "",
  footer: "ကျေးဇူးတင်ပါသည်။ ကြွရောက်ဝယ်ယူမှုအတွက်",
  paper: "80mm",
  currency: "ကျပ်",
};

export function loadSettings(): ReceiptSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: ReceiptSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

const fmt = (n: number) => new Intl.NumberFormat("my-MM").format(n);

function pageCss(paper: PaperSize) {
  if (paper === "58mm") return "@page { size: 58mm auto; margin: 2mm; } body { width: 54mm; }";
  if (paper === "80mm") return "@page { size: 80mm auto; margin: 3mm; } body { width: 74mm; }";
  return "@page { size: A4; margin: 12mm; } body { max-width: 180mm; margin: 0 auto; }";
}

export function buildReceiptHtml(
  items: ReceiptItem[],
  total: number,
  settings: ReceiptSettings,
) {
  const now = new Date();
  const dateStr = now.toLocaleString("my-MM");
  const receiptNo = "R-" + now.getTime().toString().slice(-8);
  const cur = settings.currency;

  const rows = items
    .map(
      (it) => `
      <tr>
        <td class="l">${escapeHtml(it.name)}<br/><span class="muted">${fmt(it.price)} × ${it.qty}</span></td>
        <td class="r">${fmt(it.price * it.qty)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Receipt ${receiptNo}</title>
<style>
  ${pageCss(settings.paper)}
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", "Padauk", Arial, sans-serif; color:#000; font-size:12px; padding:0; margin:0; }
  h1 { font-size: 15px; text-align:center; margin: 0 0 4px; }
  .center { text-align:center; }
  .muted { color:#555; font-size: 10px; }
  hr { border:0; border-top:1px dashed #000; margin:6px 0; }
  table { width:100%; border-collapse: collapse; }
  td { padding: 3px 0; vertical-align: top; }
  .l { text-align:left; }
  .r { text-align:right; white-space:nowrap; }
  .total { font-size: 14px; font-weight: 700; }
  .foot { margin-top: 8px; text-align:center; font-size: 11px; }
</style>
</head>
<body>
  <h1>${escapeHtml(settings.shopName)}</h1>
  ${settings.address ? `<div class="center muted">${escapeHtml(settings.address)}</div>` : ""}
  ${settings.phone ? `<div class="center muted">☎ ${escapeHtml(settings.phone)}</div>` : ""}
  <hr/>
  <div class="muted">No: ${receiptNo}</div>
  <div class="muted">${dateStr}</div>
  <hr/>
  <table>${rows}</table>
  <hr/>
  <table>
    <tr><td class="l total">စုစုပေါင်း</td><td class="r total">${fmt(total)} ${escapeHtml(cur)}</td></tr>
  </table>
  <div class="foot">${escapeHtml(settings.footer)}</div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 150); };</script>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function printReceipt(items: ReceiptItem[], total: number, settings?: ReceiptSettings) {
  const s = settings ?? loadSettings();
  const html = buildReceiptHtml(items, total, s);
  const w = window.open("", "_blank", "width=420,height=640");
  if (!w) {
    alert("Popup blocker ကြောင့် print window မဖွင့်နိုင်ပါ။ Popup ခွင့်ပြုပေးပါ။");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
