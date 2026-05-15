import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#05080d] px-4 py-10 text-sm text-slate-500 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/seenyt-mark.png" alt="SeenYT" width={34} height={34} className="rounded-lg" />
            <div>
              <div className="text-lg font-black text-white">SeenYT</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                YouTube Content OS
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-xl leading-7">
            SeenYT helps YouTube creators research niches, plan workflows, produce videos, optimize SEO, and decide the next action with AI Coach.
          </p>
        </div>

        <div>
          <h5 className="font-black uppercase tracking-[0.18em] text-slate-300">Product</h5>
          <ul className="mt-4 space-y-3">
            <li><Link href="/dashboard" className="hover:text-cyan-300">Studio</Link></li>
            <li><Link href="/dashboard/ai-coach" className="hover:text-cyan-300">AI Coach</Link></li>
            <li><Link href="/pricing" className="hover:text-cyan-300">Pricing</Link></li>
            <li><Link href="/guides" className="hover:text-cyan-300">Guides</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-black uppercase tracking-[0.18em] text-slate-300">Legal</h5>
          <ul className="mt-4 space-y-3">
            <li><Link href="/legal" className="hover:text-cyan-300">Legal Info</Link></li>
            <li><Link href="/terms" className="hover:text-cyan-300">Terms</Link></li>
            <li><Link href="/privacy" className="hover:text-cyan-300">Privacy</Link></li>
            <li><Link href="/contact" className="hover:text-cyan-300">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-slate-600 md:text-left">
        © {year} SeenYT. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
