import { Button } from "./ui/button";
import { Star } from "lucide-react";

interface HeaderProps {
    onLoginClick?: () => void;
    onRequestDemo?: () => void;
}

export function Header({ onLoginClick, onRequestDemo }: HeaderProps) {
    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-6 flex items-center justify-around shadow-md">
            {/* Logo */}
            <a href="#">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <span className="text-xl ms-2">FeedbackPro</span>
                </div>
            </a>

            {/* Nav Bar */}
            <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition">
                    Features
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">
                    Reference
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
                    Pricing
                </a>
                <Button variant="ghost" onClick={onLoginClick}>
                    Sign In
                </Button>
                <Button variant="outline" onClick={onRequestDemo}>
                    Request Demo
                </Button>
            </div>
        </nav>
    );
}
