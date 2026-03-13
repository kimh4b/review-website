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
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">
              Start today with our service
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your restaurant. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-orange-500 shadow-lg scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-orange-500 text-white px-4 py-1 rounded-full flex items-center gap-1 text-sm">
                      <Zap className="w-4 h-4 fill-white" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                <Button 
                  className={`w-full mb-6 rounded-sm ${
                    plan.popular 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleCTA(plan.name)}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">
              All plans include: Mobile app access
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
