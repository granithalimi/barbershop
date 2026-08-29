import { Clock, MapPin, Phone, MessageCircle, CheckCircle2, Banknote } from "lucide-react";

export default function ShopInfoSection() {
  return (
    <section id="info" className="py-16 bg-zinc-900/60 border-y border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opening Hours */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Opening Hours</h3>
            </div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Monday - Friday</span>
                <span className="text-white font-medium">09:00 - 19:00</span>
              </li>
              <li className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Saturday</span>
                <span className="text-white font-medium">09:00 - 18:00</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-zinc-400">Sunday</span>
                <span className="text-amber-400 font-medium">Closed</span>
              </li>
            </ul>
          </div>

          {/* Shop Location & Contact */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Location & Contact</h3>
            </div>
            <div className="space-y-3 text-sm text-zinc-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                142 Central Avenue, Downtown District, Suite 102
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                +1 (555) 234-5678
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                WhatsApp Direct Line Available
              </p>
            </div>
          </div>

          {/* Walk-in & Payment Policy */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Shop Policies</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Cash Only:</strong> Payments settled in person after your cut.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Guest Booking:</strong> Book anytime without registering.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>WhatsApp Alerts:</strong> Barbers confirm appointments directly.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
