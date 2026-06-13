"use client";

import { useState } from "react";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Testimonials } from "./Testimonials";
import { TopRatedStores } from "./TopRatedStores";
import { Pricing } from "./Pricing";
import { Footer } from "./Footer";
import { SignUpModal } from "./FreeTrialModal";
import { DemoModal } from "./DemoModal";
import { Toaster } from "./ui/sonner";
import { TabletSmartphone } from "lucide-react";
import Link from "next/link";

export default function AppContent() {
    const [showDemo, setShowDemo] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            <Hero />
            <SignUpModal open={false} onClose={() => {}} />
            <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />
            <Features />
            <TopRatedStores />
            <Testimonials />
          
            <Footer />

            <Link
                href="/demo-survey"
                className="fixed bottom-6 right-6 bg-orange-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-orange-600 transition-all z-50 flex items-center gap-2"
            >
                <TabletSmartphone />
                <span className="hidden sm:inline">Try Survey</span>
            </Link>

            <Toaster />
        </div>
    );
}
