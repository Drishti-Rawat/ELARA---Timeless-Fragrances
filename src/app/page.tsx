import Navbar from "@/components/Navbar";
// import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      {/* <Hero /> */}

      {/* Short placeholder for content below fold */}
      <section className="py-24 relative overflow-hidden bg-surface">
        <div className="container text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase mb-4">The Collection</p>
          <h2 className="text-4xl font-serif font-bold mb-12 text-foreground">Signature Scents</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative aspect-[3/4] overflow-hidden bg-white rounded-sm border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h3 className="text-2xl font-serif text-foreground mb-1">Essence No. {i}</h3>
                  <p className="text-gray-500 text-sm tracking-wide">Eau de Parfum</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
