import { Features } from "@/components/Features";
import { TopRatedStores } from "@/components/TopRatedStores";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { TabletSmartphone } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />

      <section id="features">
        <Features />
      </section>

      <section id="top-rated">
        <TopRatedStores />
      </section>

      <section id="testimonials">
        <Testimonials />
      </section>

      <section id="pricing">
        <Pricing />
      </section>

      <Footer />

      <Link
        href="/survey"
        className="fixed bottom-6 right-6 bg-orange-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-orange-600 transition-all z-50 flex items-center gap-2"
      >
        <TabletSmartphone />
        <span className="hidden sm:inline">Try Survey</span>
      </Link>
    </div>
  );
}