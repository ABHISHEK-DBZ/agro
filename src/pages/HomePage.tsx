import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, ArrowRight, Leaf, Droplets, Wheat, Bot,
  Menu, X, CloudSun, TrendingUp, Check,
  Shield, ChevronRight, Zap, BarChart3,
  PlayCircle, Smartphone, Globe, Wifi, MapPin, Camera
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Logo
   ───────────────────────────────────────────── */
const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <circle cx="256" cy="256" r="256" fill="#39542f" />
    <g transform="translate(256,256)" stroke="#ffffff" strokeWidth="4" fill="#ffffff">
      <path d="M-60,-80 L-60,60" strokeWidth="5" />
      <ellipse cx="-68" cy="-64" rx="7" ry="3.5" />
      <ellipse cx="-52" cy="-56" rx="7" ry="3.5" />
      <ellipse cx="-68" cy="-48" rx="7" ry="3.5" />
      <ellipse cx="-52" cy="-40" rx="7" ry="3.5" />
      <path d="M0,-100 L0,60" strokeWidth="6" />
      <ellipse cx="-8" cy="-80" rx="8" ry="4" />
      <ellipse cx="8" cy="-70" rx="8" ry="4" />
      <ellipse cx="-8" cy="-60" rx="8" ry="4" />
      <ellipse cx="8" cy="-50" rx="8" ry="4" />
      <path d="M60,-80 L60,60" strokeWidth="5" />
      <ellipse cx="52" cy="-64" rx="7" ry="3.5" />
      <ellipse cx="68" cy="-56" rx="7" ry="3.5" />
      <ellipse cx="52" cy="-48" rx="7" ry="3.5" />
      <ellipse cx="68" cy="-40" rx="7" ry="3.5" />
    </g>
    <text x="256" y="440" textAnchor="middle" fill="#ffffff" fontSize="32" fontWeight="600" fontFamily="Arial, sans-serif">SK</text>
  </svg>
);

/* ─────────────────────────────────────────────
   Animated counter hook
   ───────────────────────────────────────────── */
const useCounter = (target: number, duration: number = 2000, start: boolean = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame: number;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);
  return count;
};

/* ═════════════════════════════════════════════
   HomePage
   ═════════════════════════════════════════════ */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [demoPlaying, setDemoPlaying] = useState(false);

  const refs = {
    features: useRef<HTMLDivElement>(null),
    demo: useRef<HTMLDivElement>(null),
    impact: useRef<HTMLDivElement>(null),
    cta: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((p) => ({ ...p, [e.target.id]: true }));
      }),
      { threshold: 0.1 }
    );
    Object.values(refs).forEach((r) => { if (r.current) observer.observe(r.current); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (id.startsWith('/')) { navigate(id); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Counters
  const farmersCount = useCounter(50000, 2200, !!visible['impact']);
  const marketsCount = useCounter(2000, 2000, !!visible['impact']);
  const satisfactionCount = useCounter(98, 1800, !!visible['impact']);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#26241f] overflow-x-hidden" style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', -apple-system, sans-serif" }}>

      {/* ═══ NAVBAR ═══ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/92 backdrop-blur-xl' : 'bg-transparent'}`}
        style={scrolled ? { boxShadow: '0 1px 3px rgba(38,36,31,0.06)', borderBottom: '1px solid rgba(38,36,31,0.06)' } : undefined}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
              <Logo />
              <div>
                <span className="text-base font-semibold text-[#2f4328] block leading-tight">Smart Krishi</span>
                <span className="text-[10px] text-[#7a7364] font-medium tracking-wider uppercase">Sahayak</span>
              </div>
            </button>
            <nav className="hidden md:flex items-center gap-1">
              {['Features', 'Demo', 'About'].map((label) => (
                <button key={label} onClick={() => scrollTo(label === 'About' ? '/about' : label.toLowerCase())}
                  className="px-3.5 py-2 text-sm font-medium text-[#615b4f] hover:text-[#2f4328] hover:bg-[#f1efe9] rounded-lg transition-colors">
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/login')} className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[#615b4f] hover:text-[#2f4328] transition-colors">
                Sign in
              </button>
              <button onClick={() => navigate('/register')}
                className="px-5 py-2.5 bg-[#39542f] hover:bg-[#2f4328] text-white text-sm font-semibold rounded-lg transition-all active:scale-[0.98]"
                style={{ boxShadow: '0 1px 3px rgba(57,84,47,0.2)' }}>
                Get Started
              </button>
              <button className="md:hidden p-2 text-[#615b4f]" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden bg-white rounded-b-xl px-4 py-3 space-y-1 mb-2" style={{ boxShadow: '0 8px 24px rgba(38,36,31,0.06)' }}>
              {[['Features', 'features'], ['Demo', 'demo'], ['About', '/about'], ['Sign in', '/login']].map(([label, href]) => (
                <button key={label} onClick={() => scrollTo(href)}
                  className="block w-full text-left px-3 py-2.5 text-sm font-medium text-[#615b4f] hover:text-[#2f4328] hover:bg-[#f1efe9] rounded-lg">
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[94vh] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-farmland.png" alt="" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(20,30,18,0.92) 0%, rgba(20,30,18,0.75) 40%, rgba(20,30,18,0.45) 100%)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full relative z-10 py-12 sm:py-20">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left content — 3 cols */}
            <div className="lg:col-span-3 space-y-7">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15"
                style={{ animation: 'fade-in-up 600ms cubic-bezier(0.16,1,0.3,1) both' }}>
                <span className="w-2 h-2 rounded-full bg-[#7ea26d] animate-pulse" />
                <span className="text-xs font-medium text-[#c7d9bf]">50,000+ किसान पहले से जुड़े हैं</span>
              </div>

              <h1 className="text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.05] tracking-[-0.035em] text-white"
                style={{ animation: 'fade-in-up 600ms cubic-bezier(0.16,1,0.3,1) 100ms both' }}>
                Your farm,
                <br />
                <span className="text-[#a3bf96]">smarter.</span>
              </h1>

              <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-md"
                style={{ animation: 'fade-in-up 600ms cubic-bezier(0.16,1,0.3,1) 200ms both' }}>
                Disease detection, weather alerts, mandi prices, gov schemes — one app that speaks your language.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3"
                style={{ animation: 'fade-in-up 600ms cubic-bezier(0.16,1,0.3,1) 300ms both' }}>
                <button onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#2f4328] font-semibold rounded-xl hover:bg-[#f3f7f1] transition-all active:scale-[0.98]"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  शुरू करें — मुफ़्त <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => scrollTo('demo')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-white/80 font-medium rounded-xl border border-white/15 hover:bg-white/8 transition-colors">
                  <PlayCircle className="w-4 h-4" /> Watch Demo
                </button>
              </div>
            </div>

            {/* Right — live mini-dashboard (2 cols) */}
            <div className="lg:col-span-2 hidden lg:block" style={{ animation: 'fade-in-up 700ms cubic-bezier(0.16,1,0.3,1) 400ms both' }}>
              <div className="bg-white/[0.07] backdrop-blur-lg rounded-2xl border border-white/10 p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#7ea26d]" />
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Live Dashboard Preview</span>
                </div>
                {/* Mini weather card */}
                <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-[#edbe5d]" />
                    <div>
                      <p className="text-white text-sm font-semibold">32°C Sunny</p>
                      <p className="text-white/50 text-[11px]">Karnal, Haryana</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-[11px]">Humidity</p>
                    <p className="text-white text-sm font-medium">68%</p>
                  </div>
                </div>
                {/* Mini mandi card */}
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/50 text-[11px] uppercase tracking-wider mb-2">Today's Mandi Rates</p>
                  <div className="space-y-1.5">
                    {[
                      { crop: 'Wheat', price: '₹2,450', change: '+₹40', up: true },
                      { crop: 'Rice (Basmati)', price: '₹3,850', change: '+₹120', up: true },
                      { crop: 'Mustard', price: '₹5,200', change: '-₹30', up: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white/80">{item.crop}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{item.price}</span>
                          <span className={`text-[11px] ${item.up ? 'text-[#7ea26d]' : 'text-[#e06b5e]'}`}>{item.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Mini AI tip */}
                <div className="bg-[#476a39]/30 rounded-xl p-3 flex items-start gap-2">
                  <Bot className="w-4 h-4 text-[#a3bf96] mt-0.5 shrink-0" />
                  <p className="text-[12px] text-white/70 leading-relaxed">
                    <span className="text-[#a3bf96] font-medium">AI Tip:</span> गेहूं में अगली सिंचाई 3 दिन बाद करें। मौसम साफ रहेगा।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to page */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8f7f5] to-transparent" />
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section className="py-6 bg-white border-b border-[rgba(38,36,31,0.06)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-[#7a7364]">
            {[
              { icon: Smartphone, text: 'Works on any phone' },
              { icon: Globe, text: 'Hindi, English + 13 languages' },
              { icon: Wifi, text: 'Works offline too' },
              { icon: MapPin, text: '2000+ mandis covered' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#476a39]" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — Asymmetric layout ═══ */}
      <section id="features" ref={refs.features}
        className={`py-20 sm:py-28 px-4 sm:px-6 transition-all duration-700 ${visible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-14">
            <span className="text-[11px] font-semibold text-[#476a39] uppercase tracking-[0.15em]">What You Get</span>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold text-[#283823] mt-3 leading-tight tracking-[-0.025em]">
              Not just another farming app.
            </h2>
            <p className="text-[#615b4f] mt-3 text-base leading-relaxed">
              Real tools that solve real problems — from disease diagnosis to getting the best mandi price.
            </p>
          </div>

          {/* Feature Row 1: Big image + 2 stacked cards */}
          <div className="grid lg:grid-cols-5 gap-4 mb-4">
            {/* Big feature with image */}
            <div className="lg:col-span-3 relative rounded-2xl overflow-hidden group" style={{ minHeight: '340px' }}>
              <img src="/farmer-phone.png" alt="Farmer using Smart Krishi app" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2617]/90 via-[#1a2617]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4 text-[#a3bf96]" />
                  <span className="text-[11px] font-semibold text-[#a3bf96] uppercase tracking-wider">Disease Detection</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Snap a photo. Get a diagnosis.</h3>
                <p className="text-sm text-white/70 max-w-md">
                  Our AI identifies 50+ crop diseases from a single photo and suggests treatments instantly. No internet needed.
                </p>
              </div>
            </div>

            {/* 2 stacked cards */}
            <div className="lg:col-span-2 grid gap-4">
              <div className="bg-white rounded-2xl border border-[rgba(38,36,31,0.08)] p-6 hover:border-[#c7d9bf] transition-all hover:-translate-y-0.5"
                style={{ boxShadow: '0 1px 3px rgba(38,36,31,0.04)' }}>
                <div className="w-10 h-10 rounded-xl bg-[#f3f7f1] flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-[#476a39]" />
                </div>
                <h3 className="text-base font-semibold text-[#2f4328] mb-1">Live Mandi Prices</h3>
                <p className="text-sm text-[#615b4f] leading-relaxed">Real-time rates from 2000+ markets. Compare, decide, sell smart.</p>
              </div>
              <div className="bg-white rounded-2xl border border-[rgba(38,36,31,0.08)] p-6 hover:border-[#c7d9bf] transition-all hover:-translate-y-0.5"
                style={{ boxShadow: '0 1px 3px rgba(38,36,31,0.04)' }}>
                <div className="w-10 h-10 rounded-xl bg-[#f3f7f1] flex items-center justify-center mb-3">
                  <CloudSun className="w-5 h-5 text-[#476a39]" />
                </div>
                <h3 className="text-base font-semibold text-[#2f4328] mb-1">Weather Alerts</h3>
                <p className="text-sm text-[#615b4f] leading-relaxed">Hyperlocal forecasts. Get frost, heatwave, and rain alerts for your field.</p>
              </div>
            </div>
          </div>

          {/* Feature Row 2: 4 equal cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Bot, title: 'AI Assistant', desc: 'Ask anything about farming — in Hindi or English. Voice supported.' },
              { icon: Leaf, title: 'Soil Testing', desc: 'Track pH, NPK levels. Get personalized fertilizer plans.' },
              { icon: Shield, title: 'Gov Schemes', desc: 'PM-KISAN, PMFBY, KCC — check eligibility and apply.' },
              { icon: Wheat, title: 'Crop Calendar', desc: 'When to sow, irrigate, fertilize — region-specific schedules.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[rgba(38,36,31,0.08)] p-5 hover:border-[#c7d9bf] transition-all hover:-translate-y-0.5"
                  style={{ boxShadow: '0 1px 3px rgba(38,36,31,0.04)' }}>
                  <div className="w-9 h-9 rounded-lg bg-[#f3f7f1] flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-[#476a39]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#2f4328] mb-1">{f.title}</h3>
                  <p className="text-[13px] text-[#615b4f] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ DEMO VIDEO SECTION ═══ */}
      <section id="demo" ref={refs.demo}
        className={`py-20 sm:py-28 px-4 sm:px-6 bg-white transition-all duration-700 ${visible['demo'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-semibold text-[#476a39] uppercase tracking-[0.15em]">See It In Action</span>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold text-[#283823] mt-3 leading-tight tracking-[-0.025em]">
              Built for simplicity
            </h2>
            <p className="text-[#615b4f] mt-3 text-base leading-relaxed">
              Watch how easy it is to use Smart Krishi Sahayak. No training needed — just sign up and go.
            </p>
          </div>

          {/* Demo video player */}
          <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a]"
            style={{ boxShadow: '0 16px 48px rgba(38,36,31,0.12), 0 4px 12px rgba(38,36,31,0.06)' }}>
            {/* Browser chrome */}
            <div className="bg-[#2a2a2a] px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 bg-[#1a1a1a] rounded-md px-3 py-1 text-xs text-[#888] font-mono text-center">
                smart-krishi-sahayak.app
              </div>
            </div>

            {/* Video/Demo content */}
            <div className="relative aspect-video bg-[#111]">
              {demoPlaying ? (
                <img src="/demo-walkthrough.webp" alt="App demo walkthrough" className="w-full h-full object-contain" />
              ) : (
                <>
                  {/* Static preview with play button */}
                  <img src="/crop-aerial.png" alt="Smart Krishi Sahayak preview" className="w-full h-full object-cover opacity-40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <button onClick={() => setDemoPlaying(true)}
                      className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/25 transition-all hover:scale-110 active:scale-95">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </button>
                    <p className="text-white/60 text-sm font-medium">Click to watch demo</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Feature highlights below video */}
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {[
              { icon: Zap, title: 'Sign up in 30 sec', desc: 'Just phone number. No long forms.' },
              { icon: Smartphone, title: 'Works everywhere', desc: 'Any phone, any network, even offline.' },
              { icon: BarChart3, title: 'See results fast', desc: 'Personalized insights from day one.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#f3f7f1] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#476a39]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#2f4328]">{item.title}</h4>
                    <p className="text-[13px] text-[#7a7364]">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ IMPACT / STATS ═══ */}
      <section id="impact" ref={refs.impact}
        className={`py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden transition-all duration-700 ${visible['impact'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="absolute inset-0">
          <img src="/crop-aerial.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1a2617]/85 backdrop-blur-sm" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <span className="text-[11px] font-semibold text-[#a3bf96] uppercase tracking-[0.15em]">Our Impact</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-[-0.025em]">
              Numbers that matter
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{farmersCount.toLocaleString()}+</p>
              <p className="text-[#a3bf96] mt-2 text-sm">Farmers using the platform</p>
              <p className="text-white/40 text-xs mt-1">across 18 states in India</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{marketsCount.toLocaleString()}+</p>
              <p className="text-[#a3bf96] mt-2 text-sm">Mandis connected</p>
              <p className="text-white/40 text-xs mt-1">live prices updated hourly</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{satisfactionCount}%</p>
              <p className="text-[#a3bf96] mt-2 text-sm">Farmer satisfaction rate</p>
              <p className="text-white/40 text-xs mt-1">based on 5,000+ reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF — Real quotes ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-xl mb-14">
            <span className="text-[11px] font-semibold text-[#476a39] uppercase tracking-[0.15em]">Farmer Voices</span>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold text-[#283823] mt-3 leading-tight tracking-[-0.025em]">
              Don't take our word for it
            </h2>
          </div>

          {/* Staggered testimonials — not identical cards */}
          <div className="space-y-6">
            {/* Big quote */}
            <div className="bg-[#39542f] rounded-2xl p-8 sm:p-10 text-white" style={{ boxShadow: '0 4px 24px rgba(57,84,47,0.2)' }}>
              <p className="text-lg sm:text-xl leading-relaxed mb-6 font-light">
                "इस ऐप ने मेरी गेहूं की उपज <span className="font-semibold text-[#c7d9bf]">30% बढ़ा दी</span>। मंडी भाव सही समय पर मिलने से बेहतर दाम मिले। पहले मुझे 3 मंडियों में जाकर भाव पूछना पड़ता था।"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-base font-semibold">R</div>
                <div>
                  <p className="font-semibold">Ramesh Patel</p>
                  <p className="text-white/60 text-sm">Wheat Farmer · Karnal, Haryana</p>
                </div>
              </div>
            </div>

            {/* Two smaller quotes side by side */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[rgba(38,36,31,0.08)] p-6" style={{ boxShadow: '0 1px 3px rgba(38,36,31,0.04)' }}>
                <p className="text-sm text-[#4d483f] leading-relaxed mb-5">
                  "फसल रोग पहचान बहुत काम का है। फोटो भेजो, तुरंत जवाब मिलता है। पहले KVK जाने में पूरा दिन लगता था, अब 2 मिनट में पता चल जाता है।"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[rgba(38,36,31,0.06)]">
                  <div className="w-9 h-9 rounded-full bg-[#f3f7f1] flex items-center justify-center text-sm font-semibold text-[#476a39]">S</div>
                  <div>
                    <p className="text-sm font-semibold text-[#2f4328]">Sunita Devi</p>
                    <p className="text-xs text-[#7a7364]">Soybean Farmer · Vidisha, MP</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[rgba(38,36,31,0.08)] p-6" style={{ boxShadow: '0 1px 3px rgba(38,36,31,0.04)' }}>
                <p className="text-sm text-[#4d483f] leading-relaxed mb-5">
                  "The AI Assistant understood my cotton fertilizer problem perfectly. It suggested a specific mix that my local dealer confirmed was right. Saved me ₹2000 on wrong fertilizer."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[rgba(38,36,31,0.06)]">
                  <div className="w-9 h-9 rounded-full bg-[#f3f7f1] flex items-center justify-center text-sm font-semibold text-[#476a39]">M</div>
                  <div>
                    <p className="text-sm font-semibold text-[#2f4328]">Manjunath K.</p>
                    <p className="text-xs text-[#7a7364]">Cotton Farmer · Dharwad, Karnataka</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section id="cta" ref={refs.cta}
        className={`py-20 sm:py-28 px-4 sm:px-6 bg-white transition-all duration-700 ${visible['cta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#283823] tracking-[-0.03em] leading-tight mb-5">
            Ready to farm smarter?
          </h2>
          <p className="text-lg text-[#615b4f] mb-8 max-w-md mx-auto leading-relaxed">
            Free to use. No credit card. Works in Hindi and English. Join 50,000+ farmers today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#39542f] text-white font-semibold rounded-xl hover:bg-[#2f4328] transition-all active:scale-[0.98]"
              style={{ boxShadow: '0 2px 8px rgba(57,84,47,0.15)' }}>
              Create Free Account <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => scrollTo('demo')}
              className="inline-flex items-center gap-2 px-6 py-4 text-[#615b4f] font-medium rounded-xl border border-[rgba(38,36,31,0.12)] hover:bg-[#f1efe9] transition-colors">
              <PlayCircle className="w-4 h-4" /> Watch Demo First
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-[#9b9482]">
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#476a39]" /> 100% Free</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#476a39]" /> No signup hassle</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#476a39]" /> Works offline</span>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-10 px-4 sm:px-6 bg-[#141e12] border-t border-[rgba(255,255,255,0.04)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <Sprout className="w-5 h-5 text-[#7ea26d]" />
              <span className="text-sm font-semibold text-[#c7d9bf]">Smart Krishi Sahayak</span>
            </div>
            <div className="flex items-center gap-6">
              {[['Privacy', '/privacy'], ['Terms', '/terms'], ['About', '/about']].map(([label, href]) => (
                <button key={label} onClick={() => navigate(href)} className="text-xs text-[#615b4f] hover:text-[#c7d9bf] transition-colors">{label}</button>
              ))}
            </div>
            <p className="text-xs text-[#4d483f]">&copy; 2026 Smart Krishi Sahayak</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
