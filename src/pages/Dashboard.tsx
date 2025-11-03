import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import ContactManager from "@/components/ContactManager";
import SOSButton from "@/components/SOSButton";
import SmartRouting from "@/components/SmartRouting";
import AlertBanner from "@/components/AlertBanner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    toast.success("User ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const testAlert = async () => {
    const { error } = await supabase
      .from('sos_alerts')
      .insert({
        sender_name: "Test Sender",
        recipient_user_id: userId,
        message: "This is a test alert to verify the live alert system is working.",
        location: { lat: 0, lon: 0 },
      });

    if (error) {
      toast.error("Failed to send test alert");
      return;
    }

    toast.success("Test alert sent!");
  };

  if (!userId) return null;

  return (
    <>
      <AlertBanner userId={userId} />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome to SecureSphere</h1>
              <p className="text-muted-foreground mt-1">Your personal safety dashboard</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle>Your User ID (Share with contacts)</CardTitle>
              <CardDescription>
                Share this ID with trusted contacts so they can add you to their emergency list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background p-3 rounded-lg text-sm font-mono break-all">
                  {userId}
                </code>
                <Button onClick={copyUserId} size="icon" variant="outline">
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardHeader>
              <CardTitle>Enable Emergency Recording</CardTitle>
              <CardDescription>
                To automatically record audio/video during an SOS, grant permission before an emergency.
                We will only access your camera and microphone when you trigger an SOS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    stream.getTracks().forEach(track => track.stop());
                    toast.success("Camera and microphone permissions granted!");
                  } catch (err) {
                    console.error('Permission denied:', err);
                    toast.error("Permission denied. Please allow camera and microphone access.");
                  }
                }}
                className="w-full"
              >
                Grant Camera & Mic Permission
              </Button>
            </CardContent>
          </Card>


          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ContactManager userId={userId} />
              <Button onClick={testAlert} variant="outline" className="w-full">
                Test Incoming SOS Alert
              </Button>
            </div>

            <div className="space-y-6">
              <SOSButton userId={userId} />
              <SmartRouting />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
