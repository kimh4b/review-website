"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Star } from "lucide-react";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (sectionId: string) => {
    if (pathname === "/") {
      // Already on home page — just smooth scroll
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // On another page — go home then scroll
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between shadow-sm border-b border-gray-100">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-xl text-gray-900">FeedbackPro</span>
        </div>
      </Link>

      {/* Nav */}
      <div className="hidden md:flex items-center gap-8">
        <button
          onClick={() => handleNavClick("features")}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
        >
          Features
        </button>
        <button
          onClick={() => handleNavClick("partners")}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
        >
          Partners
        </button>
        <button
          onClick={() => handleNavClick("testimonials")}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
        >
          Reference
        </button>
        
        
        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
          <Button variant="ghost" onClick={() => router.push("/auth/sign-in")} className="hover:bg-gray-100">
            Sign In
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
            onClick={() => router.push("/auth/sign-up")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}