'use client';

import Navbar from "@/components/Navbar";
import Link from "next/link";
// import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-neutral-900 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block text-primary tracking-[0.3em] uppercase text-xs type-writer mb-6">
            Cosmic Luxury Fragrances
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 tracking-tight drop-shadow-lg">
            ASHBLOOM
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-12 leading-relaxed">
            Scents forged from stardust. Experience the infinite allure of the cosmos captured in glass.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/shop"
              className="px-8 py-4 bg-white text-black font-medium tracking-widest text-xs uppercase hover:bg-gray-100 transition-all duration-500 min-w-[200px]"
            >
              Discover Collection
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
