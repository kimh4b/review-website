import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Star, ChartNoAxesCombined, UserStar } from "lucide-react";
import { SignUpModal } from "./FreeTrialModal";
import { DemoModal } from "./DemoModal";

export function Hero({ onLoginClick }: { onLoginClick?: () => void }) {
    const [showSignUp, setShowSignUp] = useState(false);
    const [showDemo, setShowDemo] = useState(false);

    return (
        <>
            <div className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50">

                {/* Hero Content */}
                <div id="hero" className="container mx-auto px-4 py-20 md:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-6">
                            <Star className="w-4 h-4 fill-orange-700" />
                            <span className="text-sm">
                                Trusted by 500+ restaurants
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Improve your restaurant with real feedback
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Get more real feedback from customer reviews. Start
                            your free trial today.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                size="lg"
                                className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                                onClick={() => setShowSignUp(true)}
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setShowDemo(true)}
                            >
                                Request Demo
                            </Button>
                        </div>

                        <p className="text-sm text-gray-500 mt-4">
                            No credit card required • 14-day free trial • Cancel
                            anytime
                        </p>
                    </div>

                    {/* Hero Image/Stats */}
                    <div className="max-w-5xl mx-auto mt-16 relative">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center flex flex-col justify-center items-center">
                                    <div className="mb-2"><ChartNoAxesCombined size={40}/></div>
                                    <div className="text-3xl text-orange-500 mb-1">
                                        95%
                                    </div>
                                    <div className="text-gray-600">
                                        Customer Satisfaction
                                    </div>
                                </div>
                                <div className="text-center flex flex-col justify-center items-center">
                                    <div className="mb-2"><Star size={40}/></div>
                                    <div className="text-3xl text-orange-500 mb-1">
                                        4.8/5
                                    </div>
                                    <div className="text-gray-600">
                                        Average Rating
                                    </div>
                                </div>
                                <div className="text-center flex flex-col justify-center items-center">
                                    <div className="mb-2"><UserStar size={40}/></div>
                                    <div className="text-3xl text-orange-500 mb-1">
                                        50K+
                                    </div>
                                    <div className="text-gray-600">
                                        Reviews Collected
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SignUpModal open={showSignUp} onClose={() => setShowSignUp(false)} />
            <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />
        </>
    );
}
