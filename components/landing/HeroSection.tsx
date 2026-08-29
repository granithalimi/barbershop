import Image from "next/image";
import Link from "next/link";
import { Sparkles, Calendar, ArrowRight, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              DOWNTOWN'S PREMIER BARBERSHOP
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Master Craftsmanship. <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Modern Precision.
              </span>{" "}
              <br />
              Timeless Style.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience tailored grooming crafted by master barbers. From sharp skin
              fades to hot-towel straight razor shaves. Book online in seconds as a
              guest or member with instant WhatsApp confirmation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/book"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-8 py-4 rounded-xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/35 active:scale-95 transition-all text-base"
              >
                <Calendar className="w-5 h-5" />
                Book Your Appointment
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <a
                href="#services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium px-6 py-4 rounded-xl border border-zinc-800 transition-colors text-base"
              >
                View Services & Pricing
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-zinc-800/80 max-w-md mx-auto lg:mx-0">
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-1">
                  4.9 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-xs text-zinc-400">Master Standard</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">12+</div>
                <div className="text-xs text-zinc-400">Years Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-zinc-400">Cash at Shop</div>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/60 group">
              <Image
                src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80"
                alt="Apex Barbershop Interior"
                width={600}
                height={700}
                priority
                className="w-full h-[460px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

              {/* Floating Info Box */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-zinc-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Appointments & Walk-ins
                    </p>
                    <p className="text-sm font-medium text-white">
                      Book online to guarantee zero waiting time
                    </p>
                  </div>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
