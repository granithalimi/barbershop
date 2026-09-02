import Image from "next/image";
import Link from "next/link";

export default function BarbersSection() {
  const barbers = [
    {
      name: "Marcus Vance",
      title: "Master Barber & Founder",
      experience: "12+ Years Experience",
      specialty: "Skin Fades, Scissor Work & Modern Styles",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Leo Santos",
      title: "Senior Grooming Specialist",
      experience: "8 Years Experience",
      specialty: "Beard Sculpting & Traditional Shaves",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "David Chen",
      title: "Stylist & Precision Cutter",
      experience: "6 Years Experience",
      specialty: "Textured Crops, Tapers & Scissor Cuts",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <section id="barbers" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            THE TEAM
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Meet Your Master Barbers
          </h2>
          <p className="text-zinc-400 text-base">
            Dedicated professionals with decades of combined experience in men’s grooming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {barbers.map((barber, idx) => (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center text-center group hover:border-amber-500/40 transition-all"
            >
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-5 border-2 border-amber-500/30 group-hover:border-amber-400 transition-colors">
                <Image
                  src={barber.image}
                  alt={barber.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-bold text-white">{barber.name}</h3>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mt-1">
                {barber.title}
              </p>

              <div className="text-xs text-zinc-400 mt-2 mb-4 bg-zinc-800/80 px-3 py-1 rounded-full">
                {barber.experience}
              </div>

              <p className="text-sm text-zinc-300 mb-6">
                <strong className="text-zinc-400">Specialty:</strong>{" "}
                {barber.specialty}
              </p>

              <Link
                href="/book"
                className="w-full mt-auto inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
              >
                Book with {barber.name.split(" ")[0]}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
