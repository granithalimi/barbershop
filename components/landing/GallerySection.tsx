import Image from "next/image";

export default function GallerySection() {
  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
      title: "Skin Fade & Textured Crop",
      category: "Haircut",
    },
    {
      url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
      title: "Beard Sculpt & Clean Lineup",
      category: "Beard",
    },
    {
      url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
      title: "Classic Gentleman's Taper",
      category: "Styling",
    },
    {
      url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80",
      title: "Traditional Straight Razor Shave",
      category: "Shave",
    },
    {
      url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
      title: "Barbershop Craft & Atmosphere",
      category: "Shop",
    },
    {
      url: "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80",
      title: "Premium Tools & Precision",
      category: "Detail",
    },
  ];

  return (
    <section id="gallery" className="py-20 bg-zinc-900/40 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            OUR CRAFT IN ACTION
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Recent Cuts & Finishes
          </h2>
          <p className="text-zinc-400 text-base">
            Take a look at the daily standards delivered by our master barbers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[4/3]"
            >
              <Image
                src={img.url}
                alt={img.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-zinc-900/80 px-2 py-0.5 rounded">
                    {img.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    {img.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
