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
    <nav className="sticky top-0 z-50 bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-6 flex items-center justify-around shadow-md">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-xl ms-2">FeedbackPro</span>
        </div>
      </Link>

      {/* Nav */}
      <div className="hidden md:flex items-center gap-8">
        <button
          onClick={() => handleNavClick("features")}
          className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
        >
          Features
        </button>
        <button
          onClick={() => handleNavClick("testimonials")}
          className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
        >
          Reference
        </button>
        <Button variant="ghost" onClick={() => router.push("/auth/sign-in")}>
          Sign In
        </Button>
        <Button variant="outline" onClick={() => router.push("/auth/sign-up")}>
          Sign Up
        </Button>
      </div>
    </nav>
  );
}