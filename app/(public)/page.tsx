import { Features } from "@/components/Features";
import { TopRatedStores } from "@/components/TopRatedStores";
import { Testimonials } from "@/components/Testimonials";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";

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

      <Footer />
    </div>
  );
}