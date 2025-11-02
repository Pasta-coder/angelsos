import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SmartRouting = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [routeDescription, setRouteDescription] = useState("");
  const [showRoute, setShowRoute] = useState(false);

  const findRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start.trim() || !end.trim()) {
      toast.error("Please enter both locations");
      return;
    }

    setLoading(true);
    setShowRoute(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-safe-route', {
        body: { start, end },
      });

      if (error) throw error;

      setRouteDescription(data.description);
      setShowRoute(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Smart Safe Routing
        </CardTitle>
        <CardDescription>
          Get AI-powered safe route recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={findRoute} className="space-y-3">
          <Input
            placeholder="Start Location"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <Input
            placeholder="End Location"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding Safe Route...
              </>
            ) : (
              "Find Safe Route"
            )}
          </Button>
        </form>

        {showRoute && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="bg-secondary p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Recommended Safe Route</h4>
              <p className="text-sm text-muted-foreground">{routeDescription}</p>
            </div>

            <div className="bg-gradient-to-br from-secondary to-accent/10 p-6 rounded-lg">
              <svg
                className="w-full h-48"
                viewBox="0 0 300 150"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Safe route (solid blue) */}
                <path
                  d="M10 75 Q 75 20, 150 70 T 290 75"
                  stroke="hsl(var(--accent))"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Dangerous route (dashed red) */}
                <path
                  d="M10 75 L 290 75"
                  stroke="hsl(var(--destructive))"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
                {/* Start marker */}
                <circle cx="10" cy="75" r="6" fill="hsl(var(--primary))" />
                {/* End marker */}
                <circle cx="290" cy="75" r="6" fill="hsl(var(--primary))" />
              </svg>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Start: {start}</span>
                <span>End: {end}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartRouting;
