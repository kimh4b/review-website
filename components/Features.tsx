import { BarChart3, MessageSquare, Bell, TrendingUp, Users, Shield, Gift } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Collect Customer Feedback Easily",
    description: "Capture customer feedback instantly with QR codes. Best interface rating with estimate time 1-3 minutes"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics Dashboard",
    description: "Visual dashboards (charts, graphs) for quick insights. Calculate average ratings per category (food, service, cleanliness)."
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Get notified immediately when negative feedback comes in so you can respond quickly and prevent issues."
  },
  {
    icon: Gift,
    title: "Reward & Loyalty Integration",
    description: "Encourage customers to leave reviews with rewards or discounts, and get more even more feedback."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "View feedback, track progress, and resolve every customer concern."
  },
  {
    icon: Shield,
    title: "Anonymous & Secure",
    description: "Customers can leave honest feedback anonymously, with full data security."
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">
            Everything you need to improve your restaurant
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed to help you collect, analyze, and act on customer feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
