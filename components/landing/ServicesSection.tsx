import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      name: "Signature Haircut",
      duration: "30 mins",
      price: "$25",
      description:
        "Precision scissor and clipper cut customized to your head shape, finished with neck taper and styling.",
      popular: true,
    },
    {
      name: "Beard Sculpt & Razor Lineup",
      duration: "20 mins",
      price: "$15",
      description:
        "Beard length trimming, precise line edging with straight razor, and nourishing oil massage.",
      popular: false,
    },
    {
      name: "The Full Treatment (Haircut + Beard)",
      duration: "45 mins",
      price: "$35",
      description:
        "Complete package: Custom haircut, styling, full beard detailing, hot towel compress, and razor finish.",
      popular: true,
    },
    {
      name: "Royal Hot Towel Shave",
      duration: "30 mins",
      price: "$20",
      description:
        "Traditional straight-razor shave with warm lather, essential oils, hot towels, and soothing balm.",
      popular: false,
    },
    {
      name: "Kids & Senior Haircut",
      duration: "25 mins",
      price: "$20",
      description:
        "Patient, classic grooming for young gentlemen under 12 and seniors 65+.",
      popular: false,
    },
    {
      name: "Hair & Scalp Detox Treatment",
      duration: "20 mins",
      price: "$15",
      description:
        "Deep clarifying scalp scrub, invigorating shampoo wash, and therapeutic head massage.",
      popular: false,
    },
  ];

  return (
    <section id="services" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            MENU & PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Crafted Services for Every Style
          </h2>
          <p className="text-zinc-400 text-base">
            Transparent cash pricing with no hidden fees. Choose your service and book with your favorite barber.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <div
              key={idx}
              className={`relative p-6 rounded-2xl bg-zinc-900 border transition-all hover:border-amber-500/50 flex flex-col justify-between ${
                service.popular
                  ? "border-amber-500/40 shadow-lg shadow-amber-500/5"
                  : "border-zinc-800"
              }`}
            >
              {service.popular && (
                <span className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-bold text-white">{service.name}</h3>
                  <div className="text-2xl font-extrabold text-amber-400">
                    {service.price}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800/60 px-2.5 py-1 rounded-md mb-4">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {service.duration}
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              <Link
                href="/book"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200"
              >
                Book This Service
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
