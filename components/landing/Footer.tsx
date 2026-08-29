import Link from "next/link";
import { Scissors } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/80 py-12 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-white text-sm">APEX BARBERSHOP</span>
          <span className="text-zinc-600">|</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 text-zinc-400">
          <a href="#services" className="hover:text-zinc-200 transition-colors">
            Services
          </a>
          <a href="#gallery" className="hover:text-zinc-200 transition-colors">
            Gallery
          </a>
          <a href="#barbers" className="hover:text-zinc-200 transition-colors">
            Barbers
          </a>
          <Link href="/login" className="hover:text-zinc-200 transition-colors">
            Staff / Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
