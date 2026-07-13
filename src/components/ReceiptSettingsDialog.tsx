import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";
import { loadSettings, saveSettings, printReceipt, type PaperSize, type ReceiptSettings } from "@/lib/printReceipt";
import { toast } from "sonner";

const ReceiptSettingsDialog = ({ trigger }: { trigger?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<ReceiptSettings>(() => loadSettings());

  const update = (k: keyof ReceiptSettings, v: string) => setS((prev) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    saveSettings(s);
    toast.success("Print setup သိမ်းပြီးပါပြီ");
    setOpen(false);
  };

  const handleTest = () => {
    saveSettings(s);
    printReceipt(
      [
        { name: "နမူနာ ပစ္စည်း A", qty: 1, price: 2500 },
        { name: "နမူနာ ပစ္စည်း B", qty: 2, price: 1500 },
      ],
      5500,
      s,
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Printer className="h-4 w-4" /> Print Setup
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" /> Receipt Printer Setup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>ဆိုင်နာမည်</Label>
            <Input value={s.shopName} onChange={(e) => update("shopName", e.target.value)} />
          </div>
          <div>
            <Label>လိပ်စာ</Label>
            <Input value={s.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div>
            <Label>ဖုန်း</Label>
            <Input value={s.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <Label>အောက်ခြေစာသား</Label>
            <Input value={s.footer} onChange={(e) => update("footer", e.target.value)} />
          </div>
          <div>
            <Label>စက္ကူအရွယ်</Label>
            <div className="flex gap-2 mt-1">
              {(["58mm", "80mm", "A4"] as PaperSize[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update("paper", p)}
                  className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${
                    s.paper === p ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              58mm/80mm သည် thermal receipt printer များအတွက်။ Browser print dialog မှ printer ကို ရွေးပြီး ရိုက်နိုင်ပါသည်။
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleTest}>
            <Printer className="h-4 w-4 mr-1.5" /> Test Print
          </Button>
          <Button onClick={handleSave}>သိမ်းမည်</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptSettingsDialog;
