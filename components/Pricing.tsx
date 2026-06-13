'use client'

import { Button } from "./ui/button";
import { Check, Zap } from "lucide-react";
import { useState } from "react";
import { SignUpModal } from "./FreeTrialModal";
import { DemoModal } from "./DemoModal";

const plans = [
  {
    name: "Basic",
    price: "$49",
    period: "/month",
    description: "Perfect for small restaurants just getting started",
    features: [
      "Up to 200 reviews per month",
      "Basic analytics dashboard",
      "Email notifications",
      "QR code feedback collection",
      "Email support",
      "1 location"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Pro",
    price: "$149",
    period: "/month",
    description: "Advanced features for growing restaurants",
    features: [
      "Unlimited reviews",
      "Advanced analytics & reporting",
      "Real-time alerts (SMS + Email)",
      "AI sentiment analysis",
      "Team collaboration tools",
      "Custom surveys",
      "Priority support",
      "Up to 5 locations",
      "A/B testing",
      "API access"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For restaurant chains and large operations",
    features: [
      "Everything in Pro",
      "Unlimited locations",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options",
      "Advanced security & compliance",
      "Custom training & onboarding",
      "SLA guarantee"
    ],
    cta: "Request Demo",
    popular: false
  }
];

export function Pricing() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handleCTA = (planName: string) => {
    setSelectedPlan(planName);
    if (planName === "Enterprise") {
      setShowDemo(true);
    } else {
      setShowSignUp(true);
    }
  };

  return (
    <>
      <section id="pricing" className="py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Decorative gradient blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl mb-6 text-white">
              Simple, transparent pricing
            </h2>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Choose the perfect plan for your restaurant. All plans include a 14-day free trial with no credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`group relative bg-gray-800 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl ${
                  plan.popular 
                    ? 'border-2 border-orange-500 shadow-2xl md:scale-105 bg-gradient-to-br from-gray-800 to-gray-900' 
                    : 'border border-gray-700 hover:border-gray-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm shadow-lg">
                      <Zap className="w-4 h-4 fill-white" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-3xl mb-3 text-white">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-3">
                    <span className="text-5xl text-white">{plan.price}</span>
                    <span className="text-gray-400 text-lg">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-base">{plan.description}</p>
                </div>

                <Button 
                  className={`w-full mb-8 py-6 text-base transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                  onClick={() => handleCTA(plan.name)}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-4">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                      <span className="text-gray-300 text-base leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <p className="text-gray-300 mb-4 text-lg">
              All plans include: Mobile app access • Email support • Data export
            </p>
            <p className="text-sm text-gray-500">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <SignUpModal 
        open={showSignUp} 
        onClose={() => setShowSignUp(false)} 
        selectedPlan={selectedPlan}
      />
      <DemoModal 
        open={showDemo} 
        onClose={() => setShowDemo(false)} 
      />
    </>
  );
}
