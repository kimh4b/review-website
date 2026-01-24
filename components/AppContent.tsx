"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Testimonials } from "./Testimonials";
import { TopRatedStores } from "./TopRatedStores";
import { Pricing } from "./Pricing";
import { Footer } from "./Footer";
import { LoginPage } from "./auth/LoginPage";
import { SignUpPage } from "./auth/SignUpPage";
import { DashboardLayout } from "./dashboard/DashboardLayout";
import { AdminDashboardLayout } from "./admin/AdminDashboardLayout";
import { SurveyFlow } from "./survey-flow/SurveyFlow";
import { SignUpModal } from "./FreeTrialModal";
import { DemoModal } from "./DemoModal";
import { Toaster } from "./ui/sonner";
import { useAuth } from "../contexts/AuthContext";
import { TabletSmartphone } from 'lucide-react';

export default function AppContent() {
    const { user } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showDemo, setShowDemo] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);

    // Survey check from URL (run only once)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("survey") === "true") {
            setShowSurvey(true);
        }
    }, []);

    // Survey flow
    if (showSurvey) {
        return <SurveyFlow onClose={() => setShowSurvey(false)} />;
    }

    // Admin dashboard
    if (user?.role === "admin") {
        return <AdminDashboardLayout />;
    }

    // Restaurant owner dashboard
    if (user) {
        return <DashboardLayout />;
    }

    // Login modal
    if (showLogin) {
        return (
            <LoginPage
                onSignUpClick={() => {
                    setShowLogin(false);
                    setShowSignUp(true);
                }}
                onBack={() => setShowLogin(false)}
            />
        );
    }

    // Sign Up modal
    if (showSignUp) {
        return (
            <SignUpPage
                onLoginClick={() => {
                    setShowSignUp(false);
                    setShowLogin(true);
                }}
                onBack={() => setShowSignUp(false)}
            />
        );
    }

    // Landing Page
    return (
        <div className="min-h-screen bg-white">
            {/* Header with shared handlers */}
            <Header
                onLoginClick={() => setShowLogin(true)}
                onRequestDemo={() => setShowDemo(true)}
            />

            {/* Hero with shared handlers */}
            <Hero/>

            {/* Modals rendered here */}
            <SignUpModal open={showSignUp} onClose={() => setShowSignUp(false)} />
            <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />

            {/* Other sections */}
            <Features />
            <TopRatedStores />
            <Testimonials />
            <Pricing />
            <Footer />

            {/* Demo Survey Button */}
            <button
                onClick={() => setShowSurvey(true)}
                className="fixed bottom-6 right-6 bg-orange-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-orange-600 transition-all z-50 flex items-center gap-2"
                title="Try Customer Survey"
            >
                <TabletSmartphone/>
                <span className="hidden sm:inline">Try Survey</span>
            </button>

            <Toaster />
        </div>
    );
}
