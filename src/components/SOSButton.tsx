import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SOSButtonProps {
  userId: string;
}

const SOSButton = ({ userId }: SOSButtonProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sosDetails, setSosDetails] = useState<{ message: string; location: any } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [userId]);

  useEffect(() => {
    if (clickCount === 1) {
      const timer = setTimeout(() => {
        if (clickCount === 1) {
          sendSOS(false);
        }
        setClickCount(0);
      }, 300);
      return () => clearTimeout(timer);
    } else if (clickCount === 2) {
      sendSOS(true);
      setClickCount(0);
    }
  }, [clickCount]);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('prewritten_message')
      .eq('user_id', userId)
      .single();

    if (data) {
      setMessage(data.prewritten_message);
    }
  };

  const saveMessage = async () => {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        prewritten_message: message,
      });

    if (error) {
      toast.error("Failed to save message");
      return;
    }

    toast.success("Message saved!");
  };

  const sendSOS = async (useAI: boolean) => {
    setSending(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const location = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };

      let sosMessage = message;

      if (useAI) {
        const { data, error } = await supabase.functions.invoke('generate-sos-message', {
          body: { baseMessage: message },
        });

        if (error) throw error;
        sosMessage = data.message;
      }

      // Get contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId);

      if (!contacts || contacts.length === 0) {
        toast.error("No emergency contacts found");
        return;
      }

      // Send alerts to all contacts
      const alerts = contacts.map(contact => ({
        sender_name: "User",
        recipient_user_id: contact.contact_user_id,
        location,
        message: `${sosMessage} Location: ${location.lat}, ${location.lon}`,
      }));

      const { error } = await supabase
        .from('sos_alerts')
        .insert(alerts);

      if (error) throw error;

      setSosDetails({ message: sosMessage, location });
      setShowConfirmation(true);
      toast.success("SOS sent to all contacts!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send SOS");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="w-5 h-5" />
            Emergency SOS
          </CardTitle>
          <CardDescription>
            Single tap for preset message, double tap for AI-generated message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <button
              onClick={() => setClickCount(prev => prev + 1)}
              disabled={sending}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-destructive to-orange-500 hover:scale-110 transition-all duration-300 shadow-2xl flex items-center justify-center disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              ) : (
                <Shield className="w-12 h-12 text-white" />
              )}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Pre-written SOS Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Emergency! I need help. My location:"
              rows={3}
            />
            <Button onClick={saveMessage} variant="outline" className="w-full">
              Save Message
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SOS Sent Successfully!</DialogTitle>
            <DialogDescription>
              Your emergency alert has been sent to all your contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm"><strong>Message:</strong> {sosDetails?.message}</p>
            <p className="text-sm">
              <strong>Location:</strong> {sosDetails?.location.lat}, {sosDetails?.location.lon}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SOSButton;
