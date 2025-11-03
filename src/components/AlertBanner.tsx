import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

interface AlertBannerProps {
  userId: string;
}

const AlertBanner = ({ userId }: AlertBannerProps) => {
  const [alert, setAlert] = useState<any>(null);

  useEffect(() => {
    // Subscribe to new alerts
    const channel = supabase
      .channel('sos-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sos_alerts',
          filter: `recipient_user_id=eq.${userId}`,
        },
        (payload) => {
          setAlert(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (!alert) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-destructive to-orange-500 text-white p-4 shadow-2xl animate-in slide-in-from-top duration-500">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
          <div className="flex-1">
            <p className="font-bold text-lg">LIVE SOS ALERT!</p>
            <p className="text-sm">
              Your contact <strong>{alert.sender_name}</strong> has triggered an SOS!
            </p>
            <p className="text-xs mt-1">{alert.message}</p>
            {alert.media_url && (
              <a
                href={alert.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs mt-2 inline-block font-bold underline hover:text-blue-200"
              >
                📹 View Emergency Recording
              </a>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAlert(null)}
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default AlertBanner;
