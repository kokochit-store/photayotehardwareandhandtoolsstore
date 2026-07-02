import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LiveVisitors = () => {
  const { user, isAdmin, loading } = useAuth();
  const [admins, setAdmins] = useState(0);
  const [publics, setPublics] = useState(0);

  useEffect(() => {
    if (loading) return;
    const visitorId = crypto.randomUUID();
    const role: "admin" | "public" = user && isAdmin ? "admin" : "public";

    const channel = supabase.channel("online-visitors", {
      config: { presence: { key: visitorId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ role: "admin" | "public" }>();
        let a = 0;
        let p = 0;
        Object.values(state).forEach((entries) => {
          const r = (entries[0] as any)?.role;
          if (r === "admin") a++;
          else p++;
        });
        setAdmins(a);
        setPublics(p);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ role, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, loading]);

  const total = admins + publics;

  return (
    <div className="inline-flex flex-wrap items-center gap-3 rounded-full bg-background/80 backdrop-blur-sm border border-border px-4 py-2 shadow-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <span className="inline-flex items-center gap-1.5 text-sm">
        <Users className="h-4 w-4 text-foreground/70" />
        <span className="font-bold text-primary">{total}</span>
        <span className="text-foreground/80">ဦး online</span>
      </span>
      <span className="h-4 w-px bg-border" />
      <span className="inline-flex items-center gap-1.5 text-sm">
        <Users className="h-4 w-4 text-foreground/60" />
        <span className="font-semibold">{publics}</span>
        <span className="text-foreground/70">ဧည့်သည်</span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-sm">
        <Shield className="h-4 w-4 text-amber-600" />
        <span className="font-semibold">{admins}</span>
        <span className="text-foreground/70">Admin</span>
      </span>
    </div>
  );
};

export default LiveVisitors;
