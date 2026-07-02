import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

const LiveVisitors = () => {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const visitorId = crypto.randomUUID();
    const channel = supabase.channel("online-visitors", {
      config: { presence: { key: visitorId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm border border-border px-4 py-2 shadow-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <Users className="h-4 w-4 text-foreground/70" />
      <span className="text-sm font-medium text-foreground">
        <span className="font-bold text-primary">{count}</span> ဦး ကြည့်ရှုနေသည်
      </span>
    </div>
  );
};

export default LiveVisitors;
