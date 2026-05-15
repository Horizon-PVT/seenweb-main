import Link from 'next/link';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function AffiliateLanding() {
  return (
    <div className="bg-background-dark font-display text-slate-100 antialiased overflow-x-hidden min-h-screen">
      <Head>
        <title>SeenYT Affiliate | Elegant Midnight</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{
        __html: `
        .glowing-line {
            position: relative;
        }
        .glowing-line::after {
            content: '';
            position: absolute;
            background: theme('colors.accent-cyan');
            box-shadow: 0 0 10px theme('colors.accent-cyan');
        }
      `}} />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                <span className="material-symbols-outlined font-bold">query_stats</span>
              </div>
              <h2 className="text-white text-xl font-black tracking-tighter">SEEN<span className="text-primary">YT</span></h2>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a className="text-sm font-semibold text-slate-300 hover:text-primary transition-colors" href="#how-it-works">How It Works</a>
            <a className="text-sm font-semibold text-slate-300 hover:text-primary transition-colors" href="#tiers">Commission</a>
            <a className="text-sm font-semibold text-slate-300 hover:text-primary transition-colors" href="#leaderboard">Leaderboard</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <button className="text-sm font-bold text-white hover:text-primary px-4">Login</button>
            </Link>
            <Link href="/affiliate/dashboard">
              <button className="bg-primary text-background-dark px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                Join Now
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col gap-8">
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1 rounded-full w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-accent-cyan">New High-Yield Tiers Live</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white">
                  Elevate Your <br /><span className="text-primary shadow-primary">Influence.</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                  Join the most sophisticated affiliate ecosystem for creators. Real-time tracking, elite commissions, and automated weekly payouts.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/affiliate/dashboard">
                    <button className="bg-primary text-background-dark px-8 py-4 rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(242,204,13,0.3)] hover:brightness-110 transition-all">
                      Start Earning Today
                    </button>
                  </Link>
                  <Link href="/affiliate/dashboard">
                    <button className="bg-surface-dark border border-border-dark text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-800 transition-all">
                      View Dashboard Demo
                    </button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="bg-surface-dark/80 border border-border-dark rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
                  <div className="w-full bg-slate-900 rounded-lg aspect-[4/3] overflow-hidden relative" title="Sophisticated analytics dashboard mockup with glowing charts and dark theme">
                    <div className="absolute inset-0 flex flex-col p-6 gap-6">
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-32 bg-slate-800 rounded"></div>
                        <div className="h-8 w-8 bg-primary/20 rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-20 bg-slate-800/50 rounded-lg border border-slate-700"></div>
                        <div className="h-20 bg-slate-800/50 rounded-lg border border-slate-700"></div>
                        <div className="h-20 bg-slate-800/50 rounded-lg border border-slate-700"></div>
                      </div>
                      <div className="flex-1 bg-slate-800/30 rounded-lg border border-slate-700 p-4 flex items-end gap-2">
                        <div className="flex-1 bg-accent-cyan/20 h-1/2 rounded-t"></div>
                        <div className="flex-1 bg-accent-cyan/40 h-3/4 rounded-t"></div>
                        <div className="flex-1 bg-accent-cyan/20 h-2/3 rounded-t"></div>
                        <div className="flex-1 bg-primary/40 h-full rounded-t"></div>
                        <div className="flex-1 bg-accent-cyan/20 h-1/2 rounded-t"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-accent-cyan p-4 rounded-xl shadow-xl flex items-center gap-4 max-w-[200px]">
                  <span className="material-symbols-outlined text-background-dark text-3xl">payments</span>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-background-dark/60">Total Paid Out</p>
                    <p className="text-background-dark font-black text-lg">$2.4M+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Earnings Ticker */}
        <section className="border-y border-border-dark bg-surface-dark/30 py-6 overflow-hidden" id="leaderboard">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-8">
            <div className="flex items-center gap-2 shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-black uppercase tracking-widest text-white">Live Earnings</span>
            </div>
            <div className="flex gap-12 whitespace-nowrap overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">@tech_guru</span>
                <span className="text-primary font-bold">+$450.00</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">@lifestyle_vlog</span>
                <span className="text-primary font-bold">+$1,220.50</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">@gamer_central</span>
                <span className="text-primary font-bold">+$89.00</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">@finance_daily</span>
                <span className="text-primary font-bold">+$3,400.00</span>
              </div>
              <div className="flex items-center gap-2 hidden lg:flex">
                <span className="text-slate-400 font-medium">@travel_with_me</span>
                <span className="text-primary font-bold">+$210.15</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-background-dark" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">Streamlined Success</h2>
              <p className="text-slate-400">Three steps to your first commission payout.</p>
            </div>
            <div className="relative grid md:grid-cols-3 gap-12">
              {/* Glowing Connection Line */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-slate-800 z-0">
                <div className="h-full w-1/2 bg-gradient-to-r from-accent-cyan to-primary shadow-[0_0_10px_rgba(0,242,255,0.5)]"></div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center gap-6">
                <div className="size-24 rounded-2xl bg-surface-dark border border-accent-cyan/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.1)]">
                  <span className="material-symbols-outlined text-4xl text-accent-cyan">person_add</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Register</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Fast-track approval process for active content creators and influencers.</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center gap-6">
                <div className="size-24 rounded-2xl bg-surface-dark border border-primary/30 flex items-center justify-center shadow-[0_0_20px_rgba(242,204,13,0.1)]">
                  <span className="material-symbols-outlined text-4xl text-primary">campaign</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Promote</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Utilize our premium marketing assets and unique tracking links on your channel.</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center gap-6">
                <div className="size-24 rounded-2xl bg-surface-dark border border-accent-cyan/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.1)]">
                  <span className="material-symbols-outlined text-4xl text-accent-cyan">account_balance_wallet</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Earn</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Receive automated payouts via wire, PayPal, or crypto every Friday.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Tiers */}
        <section className="py-24 bg-surface-dark/50" id="tiers">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">Commission Tiers</h2>
              <p className="text-slate-400">The more you grow, the more you earn.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {/* Silver Tier */}
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 flex flex-col gap-6">
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Entry Level</p>
                  <h3 className="text-2xl font-black text-white italic">SILVER</h3>
                </div>
                <div className="text-4xl font-black text-white">15% <span className="text-sm font-normal text-slate-500">Commission</span></div>
                <ul className="flex flex-col gap-4 py-6 border-y border-border-dark flex-grow">
                  <li className="flex items-center gap-3 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> Monthly Payouts
                  </li>
                  <li className="flex items-center gap-3 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> Standard Dashboard
                  </li>
                  <li className="flex items-center gap-3 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> Email Support
                  </li>
                </ul>
                <Link href="/affiliate/dashboard" className="w-full">
                  <button className="w-full py-3 rounded-xl border border-border-dark font-bold text-white hover:bg-slate-800 transition-colors">Start Silver</button>
                </Link>
              </div>

              {/* Diamond Tier (Featured) */}
              <div className="bg-surface-dark border-2 border-primary rounded-2xl p-8 flex flex-col gap-6 relative shadow-[0_0_40px_rgba(242,204,13,0.1)] scale-105 z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
                <div>
                  <p className="text-primary font-bold uppercase tracking-widest text-xs mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">workspace_premium</span> Pro Partner
                  </p>
                  <h3 className="text-2xl font-black text-white italic">DIAMOND</h3>
                </div>
                <div className="text-4xl font-black text-white">35% <span className="text-sm font-normal text-slate-500">Commission</span></div>
                <ul className="flex flex-col gap-4 py-6 border-y border-border-dark flex-grow">
                  <li className="flex items-center gap-3 text-slate-200 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> Weekly Payouts
                  </li>
                  <li className="flex items-center gap-3 text-slate-200 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> Advanced Real-time API
                  </li>
                  <li className="flex items-center gap-3 text-slate-200 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> Custom Marketing Kits
                  </li>
                  <li className="flex items-center gap-3 text-slate-200 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> Dedicated Account Manager
                  </li>
                </ul>
                <Link href="/affiliate/dashboard" className="w-full">
                  <button className="w-full py-3 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 shadow-lg shadow-primary/20 transition-all">Go Diamond</button>
                </Link>
              </div>

              {/* Platinum Tier */}
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 flex flex-col gap-6">
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">High Volume</p>
                  <h3 className="text-2xl font-black text-white italic">PLATINUM</h3>
                </div>
                <div className="text-4xl font-black text-white">25% <span className="text-sm font-normal text-slate-500">Commission</span></div>
                <ul className="flex flex-col gap-4 py-6 border-y border-border-dark flex-grow">
                  <li className="flex items-center gap-3 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> Bi-Weekly Payouts
                  </li>
                  <li className="flex items-center gap-3 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> Detailed Analytics
                  </li>
                  <li className="flex items-center gap-3 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span> Priority Support
                  </li>
                </ul>
                <Link href="/affiliate/dashboard" className="w-full">
                  <button className="w-full py-3 rounded-xl border border-border-dark font-bold text-white hover:bg-slate-800 transition-colors">Apply Platinum</button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary opacity-5 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 flex flex-col items-center gap-8">
            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">Ready to monetize your audience like a pro?</h2>
            <p className="text-slate-400 text-lg max-w-2xl">
              Join over 5,000+ top creators who are already maximizing their revenue with SeenYT's premium affiliate infrastructure.
            </p>
            <div className="mt-4">
              <Link href="/affiliate/dashboard">
                <button className="relative group bg-primary text-background-dark px-12 py-5 rounded-full text-xl font-black transition-all hover:scale-105 active:scale-95">
                  <span className="relative z-10">Create Your Affiliate Account</span>
                  <div className="absolute inset-0 rounded-full bg-primary blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                </button>
              </Link>
              <p className="text-slate-500 mt-6 text-sm font-medium">Free to join. No hidden fees. Instant setup.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-dark py-12 bg-background-dark">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined font-bold text-sm">query_stats</span>
            </div>
            <h2 className="text-white text-lg font-black tracking-tighter">SEEN<span className="text-primary">YT</span></h2>
          </div>
          <div className="flex gap-8 text-slate-500 text-sm">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Support Center</Link>
          </div>
          <p className="text-slate-600 text-xs">© 2026 SeenYT Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'vi', ['common'])),
    },
  };
};
