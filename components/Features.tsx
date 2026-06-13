import { BarChart3, QrCode, Bell, TrendingUp, Building, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Code Survey Collection",
    description: "Generate and share unique QR codes to collect customer feedback instantly. Display in-store or on receipts for maximum responses."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics Dashboard",
    description: "Real-time charts and graphs showing response trends, average ratings by survey, and key metrics at a glance."
  },
  {
    icon: Bell,
    title: "Instant Alerts for Negative Feedback",
    description: "Get notified immediately when customers leave negative reviews so you can respond quickly and turn them into positive experiences."
  },
  {
    icon: TrendingUp,
    title: "Sentiment Analysis & Tracking",
    description: "Automatically categorize feedback as positive, neutral, or negative. Track sentiment trends over time to measure improvement."
  },
  {
    icon: Building,
    title: "Multi-Location Support",
    description: "Manage feedback across multiple branches. Filter surveys and reviews by location to track performance by restaurant."
  },
  {
    icon: Shield,
    title: "Anonymous & Secure Feedback",
    description: "Customers can leave honest feedback anonymously with full data security and privacy protection built-in."
  }
];

export function Features() {
  return (
    <section id="features" className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl mb-6 text-gray-900">
            Everything you need to improve your restaurant
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Powerful features designed to help you collect, analyze, and act on customer feedback in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = [
              { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200 hover:border-blue-400' },
              { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200 hover:border-green-400' },
              { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200 hover:border-purple-400' },
              { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-200 hover:border-red-400' },
              { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-200 hover:border-yellow-400' },
              { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-200 hover:border-indigo-400' }
            ];
            const color = colors[index % colors.length];
            
            return (
              <div 
                key={index}
                className={`group p-8 rounded-2xl border-2 ${color.border} ${color.bg} hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1`}
              >
                <div className={`w-14 h-14 ${color.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border-2 ${color.border}`}>
                  <Icon className={`w-7 h-7 ${color.icon}`} />
                </div>
                <h3 className="text-xl mb-3 text-gray-900 group-hover:text-gray-900 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
