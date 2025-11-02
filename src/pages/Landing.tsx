import { Shield, MapPin, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Instant SOS",
      description: "Alert contacts instantly with your location.",
    },
    {
      icon: MapPin,
      title: "Smart Safe Routing",
      description: "AI-powered routes that avoid high-risk areas.",
    },
    {
      icon: Bell,
      title: "Live Alerts",
      description: "Get notified in real-time if a contact triggers an SOS.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in duration-700">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl font-bold text-white drop-shadow-lg">
            SafePath
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium">
            Your partner in personal safety.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <feature.icon className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/80 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <Button
          onClick={() => navigate("/auth")}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
        >
          Get Started
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Landing;
