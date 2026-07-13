import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LiveVisitors = () => {
  const { isAdmin, loading } = useAuth();
  const [publics, setPublics] = useState(0);

  useEffect(() => {
    if (loading) return;
    // Admins are excluded entirely — they don't broadcast presence and don't see admin counts.
    if (isAdmin) return;

    const visitorId = crypto.randomUUID();

    const channel = supabase.channel("online-visitors", {
      config: { presence: { key: visitorId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setPublics(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, loading]);

  // Hide entirely from admins
  if (loading || isAdmin) return null;

  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-background/80 backdrop-blur-sm border border-border px-4 py-2 shadow-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <span className="inline-flex items-center gap-1.5 text-sm">
        <Users className="h-4 w-4 text-foreground/70" />
        <span className="font-bold text-primary">{publics}</span>
        <span className="text-foreground/80">ဦး ဈေးဝယ်နေသည်</span>
      </span>
    </div>
  );
};

export default LiveVisitors;
