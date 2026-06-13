"use client"

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowRight, Star, ChartNoAxesCombined, UserStar } from "lucide-react";

export function Hero({ onLoginClick }: { onLoginClick?: () => void }) {
    const router = useRouter();

    return (
        <>
            <div className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50 overflow-hidden">
                {/* Decorative gradient blur */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-20" />

                {/* Hero Content */}
                <div id="hero" className="container mx-auto px-4 py-20 md:py-32 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-6 hover:bg-orange-200 transition-colors duration-300">
                            <Star className="w-4 h-4 fill-orange-700" />
                            <span className="text-sm font-medium">
                                Trusted by 500+ restaurants
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                            Improve your restaurant with real feedback
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Collect genuine customer feedback instantly. Understand what your customers really think and make data-driven improvements.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-base font-semibold"
                                onClick={() => router.push("/auth/sign-up")}
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="px-8 py-6 text-base font-semibold hover:bg-gray-50 transition-colors duration-300"
                                onClick={() => router.push("/auth/sign-in")}
                            >
                                Sign In
                            </Button>
                        </div>

                        <p className="text-sm text-gray-500 mt-4">
                            Try our survey services for free — best for restaurants owners!
                        </p>
                    </div>

                    {/* Hero Image/Stats */}
                    <div className="max-w-5xl mx-auto mt-20 relative">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                                <div className="text-center flex flex-col justify-center items-center group">
                                    <div className="mb-4 w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <ChartNoAxesCombined className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="text-4xl text-gray-900 mb-2">
                                        95%
                                    </div>
                                    <div className="text-gray-600 font-medium">
                                        Customer Satisfaction 
                                    </div>
                                </div>
                                <div className="text-center flex flex-col justify-center items-center group">
                                    <div className="mb-4 w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Star className="w-8 h-8 text-yellow-600 fill-yellow-600" />
                                    </div>
                                    <div className="text-4xl text-gray-900 mb-2">
                                        4.8/5
                                    </div>
                                    <div className="text-gray-600 font-medium">
                                        Average Rating
                                    </div>
                                </div>
                                <div className="text-center flex flex-col justify-center items-center group">
                                    <div className="mb-4 w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <UserStar className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div className="text-4xl text-gray-900 mb-2">
                                        50K+
                                    </div>
                                    <div className="text-gray-600 font-medium">
                                        Reviews Collected
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

