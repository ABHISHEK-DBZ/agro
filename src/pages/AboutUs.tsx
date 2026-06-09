import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Leaf, Users, Target, Eye, ArrowRight, Check, Shield, TrendingUp, Wheat } from 'lucide-react';

const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <circle cx="256" cy="256" r="256" fill="#39542f" />
    <g transform="translate(256,256)" stroke="#ffffff" strokeWidth="4" fill="#ffffff">
      <path d="M-60,-80 L-60,60" strokeWidth="5" />
      <ellipse cx="-68" cy="-64" rx="7" ry="3.5" />
      <ellipse cx="-52" cy="-56" rx="7" ry="3.5" />
      <path d="M0,-100 L0,60" strokeWidth="6" />
      <ellipse cx="-8" cy="-80" rx="8" ry="4" />
      <ellipse cx="8" cy="-70" rx="8" ry="4" />
      <path d="M60,-80 L60,60" strokeWidth="5" />
      <ellipse cx="52" cy="-64" rx="7" ry="3.5" />
      <ellipse cx="68" cy="-56" rx="7" ry="3.5" />
    </g>
  </svg>
);

const VALUES = [
  { icon: Leaf, title: 'Rooted in India', desc: 'Built for Indian farmers, by people who understand Indian agriculture — from soil types to weather patterns to mandi systems.' },
  { icon: Users, title: 'Farmer First', desc: 'Every feature starts with a farmer\'s real problem. We design for low connectivity, multiple languages, and simple interfaces.' },
  { icon: Shield, title: 'Trust & Transparency', desc: 'No hidden fees, no data selling. Your information is encrypted and used only to improve your farming outcomes.' },
  { icon: TrendingUp, title: 'Data-Driven Impact', desc: 'We measure success by yield improvements, cost savings, and farmer satisfaction — not by downloads or vanity metrics.' },
];

const TEAM = [
  { name: 'Abhishek Jha', role: 'Founder & Developer', desc: 'Built Smart Krishi Sahayak with the vision of making AI-powered agricultural tools accessible to every Indian farmer in their own language.' },
];

const AboutUs = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#26241f] font-sans">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
              <LogoMark />
              <div className="text-left">
                <span className="text-base font-semibold text-[#2f4328] block leading-tight">Smart Krishi</span>
                <span className="text-[10px] text-[#7a7364] font-medium tracking-wider uppercase">Sahayak</span>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/login')} className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[#615b4f] hover:text-[#2f4328] transition-colors">Sign in</button>
              <button onClick={() => navigate('/register')} className="px-5 py-2 bg-[#476a39] hover:bg-[#39542f] text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-[#f3f7f1] via-[#f8f7f5] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-[#476a39] uppercase tracking-[0.12em]">About Us</span>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#283823] mt-4 tracking-[-0.02em] leading-[1.1]">
            Making smart farming <span className="text-[#476a39]">accessible to every Indian farmer</span>
          </h1>
          <p className="text-lg text-[#615b4f] mt-4 max-w-2xl mx-auto leading-relaxed">
            Smart Krishi Sahayak was founded in 2024 with a simple belief: technology should work for farmers, not the other way around. We bring AI, real-time data, and local-language support to your phone — no internet required for core features.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={() => navigate('/register')} className="inline-flex items-center gap-2 px-6 py-3 bg-[#476a39] hover:bg-[#39542f] text-white font-semibold rounded-xl transition-all shadow-md">
              Join Free <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 px-5 py-3 text-[#39542f] font-medium rounded-xl hover:bg-[#e3ecdf] transition-colors">
              Back to Home
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-4 sm:px-6 bg-white border-y border-[#e3ecdf]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '50,000+', label: 'Registered Farmers' },
              { value: '2,000+', label: 'Mandis Covered' },
              { value: '12', label: 'Indian Languages' },
              { value: '4.8★', label: 'App Store Rating' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#283823] tracking-tight">{s.value}</p>
                <p className="text-xs text-[#7a7364] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-[#476a39] uppercase tracking-[0.12em]">Our Story</span>
              <h2 className="text-3xl font-semibold text-[#283823] mt-3 tracking-[-0.02em]">Built from the ground up, for the ground</h2>
              <div className="mt-6 space-y-4 text-sm text-[#4d483f] leading-relaxed">
                <p>
                  Smart Krishi Sahayak was created by Abhishek Jha — a developer who saw firsthand how Indian farmers struggle with fragmented, English-only agricultural tools. 
                  After traveling through villages in Uttar Pradesh and Bihar, he realized the real problem wasn't a lack of data, but that existing solutions ignored local languages, 
                  offline needs, and the specific realities of Indian farming.
                </p>
                <p>
                  The result is Smart Krishi Sahayak: an app that works in Hindi, English, and regional languages. That gives AI-powered crop disease detection, mandi prices, 
                  weather forecasts, and government scheme information — all tailored for Indian farmers.
                </p>
              </div>
            </div>
            <div className="bg-[#f3f7f1] rounded-2xl p-8 border border-[#e3ecdf]">
              <div className="text-center mb-6">
                <Sprout className="w-12 h-12 text-[#476a39] mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-[#283823]">Our Mission</h3>
              </div>
              <p className="text-sm text-[#4d483f] leading-relaxed text-center">
                "To empower every Indian farmer with real-time, personalized, and actionable agricultural intelligence — in their own language, on their own terms, at zero cost."
              </p>
              <div className="mt-6 pt-6 border-t border-[#c7d9bf]">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-[#476a39] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#2f4328]">Vision</p>
                    <p className="text-xs text-[#615b4f]">A future where no farmer has to guess — where every decision is backed by data, and every farmer has equal access to the best agricultural knowledge.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#476a39] uppercase tracking-[0.12em]">Our Values</span>
            <h2 className="text-3xl font-semibold text-[#283823] mt-3 tracking-[-0.02em]">What drives us</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="bg-[#f8f7f5] rounded-xl p-6 border border-[#e3ecdf]">
                  <div className="w-10 h-10 rounded-lg bg-[#f3f7f1] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#476a39]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#2f4328] mb-2">{v.title}</h3>
                  <p className="text-sm text-[#615b4f] leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#476a39] uppercase tracking-[0.12em]">Team</span>
            <h2 className="text-3xl font-semibold text-[#283823] mt-3 tracking-[-0.02em]">The people behind Smart Krishi</h2>
            <p className="text-[#615b4f] mt-3 max-w-xl mx-auto leading-relaxed">Built by Abhishek Jha, a passionate developer creating technology solutions for Indian agriculture.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
            {TEAM.map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-[#e3ecdf]">
                <div className="w-14 h-14 rounded-full bg-[#f3f7f1] flex items-center justify-center mb-3">
                  <span className="text-lg font-semibold text-[#476a39]">{t.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#2f4328]">{t.name}</h3>
                <p className="text-xs text-[#476a39] font-medium mb-2">{t.role}</p>
                <p className="text-xs text-[#615b4f] leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-[#476a39] to-[#283823]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-[-0.02em] mb-4">Join 50,000+ farmers growing smarter</h2>
          <p className="text-[#c7d9bf] text-lg mb-8 max-w-lg mx-auto">Free to use. Available in 12 languages. Built for Indian agriculture.</p>
          <button onClick={() => navigate('/register')} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#39542f] font-semibold rounded-xl hover:bg-[#f3f7f1] transition-all shadow-lg active:scale-[0.98]">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 bg-[#141e12]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Sprout className="w-5 h-5 text-[#7ea26d]" />
              <div>
                <span className="text-sm font-semibold text-[#c7d9bf]">Smart Krishi Sahayak</span>
                <span className="text-xs text-[#7a7364] block">AI-Powered Farming</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/privacy')} className="text-xs text-[#7a7364] hover:text-[#c7d9bf] transition-colors">Privacy</button>
              <button onClick={() => navigate('/terms')} className="text-xs text-[#7a7364] hover:text-[#c7d9bf] transition-colors">Terms</button>
              <button onClick={() => navigate('/about')} className="text-xs text-[#7a7364] hover:text-[#c7d9bf] transition-colors">About</button>
            </div>
            <p className="text-xs text-[#615b4f]">&copy; 2026 Smart Krishi Sahayak. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
