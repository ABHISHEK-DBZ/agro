import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Sprout } from 'lucide-react';

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

const SECTIONS = [
  {
    title: 'Information We Collect',
    content: 'We collect information you provide when creating an account: name, email address, phone number, and location. We also collect usage data including crops you track, searches you make, and features you use. Location data helps us provide accurate weather forecasts and mandi prices for your area. Crop and disease data you upload helps us improve our AI models.'
  },
  {
    title: 'How We Use Your Information',
    content: 'Your data powers personalized crop recommendations, weather alerts, market prices, and AI responses. We use your location to show relevant mandi prices and weather forecasts. Crop data helps us improve disease detection accuracy. We never sell your personal data to third parties. We do not share your data with advertisers.'
  },
  {
    title: 'Data Storage & Security',
    content: 'All data is encrypted in transit (TLS 1.3) and at rest using AES-256. We use Firebase infrastructure with data centers in India. Our systems are regularly audited for security vulnerabilities. We retain your data for as long as your account is active. You can request complete data deletion at any time from your profile settings.'
  },
  {
    title: 'Your Rights',
    content: 'You have the right to access, update, or delete your personal data at any time. You can export your data from the Settings page. You can close your account permanently, which removes all personal data within 30 days. You can opt out of non-essential communications. You can withdraw consent for data collection (some features may stop working).'
  },
  {
    title: 'Data Sharing & Third Parties',
    content: 'We use Firebase (Google) for authentication and database hosting — data is stored in their India region. We use OpenRouter for AI responses — no personal data is shared, only anonymized queries. We do not use any advertising SDKs or analytics trackers. We do not share data with insurance companies, banks, or government agencies unless required by law.'
  },
  {
    title: 'Children\'s Privacy',
    content: 'Our service is not intended for users under 13 years of age. We do not knowingly collect data from children under 13. If we discover a child under 13 has provided us with personal data, we will delete it immediately.'
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this privacy policy periodically. Changes will be notified via the app and email. Continued use after changes constitutes acceptance of the updated policy. Major changes will be highlighted with a notice in the app dashboard.'
  },
  {
    title: 'Contact Us',
    content: 'For privacy-related questions, contact our Data Protection Officer at privacy@smartkrishi.app. You can also reach us through the app\'s Help & Support section. We aim to respond within 48 hours.'
  },
];

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#26241f] font-sans">
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

      <section className="pt-32 pb-12 px-4 sm:px-6 bg-gradient-to-b from-[#f3f7f1] via-[#f8f7f5] to-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#f3f7f1] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#476a39]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#476a39] uppercase tracking-[0.12em]">Legal</span>
              <h1 className="text-3xl sm:text-4xl font-semibold text-[#283823] mt-1 tracking-[-0.02em]">Privacy Policy</h1>
              <p className="text-sm text-[#7a7364] mt-1">Last updated: June 1, 2026</p>
            </div>
          </div>
          <p className="text-sm text-[#4d483f] leading-relaxed max-w-2xl mt-4">
            At Smart Krishi Sahayak, your privacy is fundamental to how we operate. This policy describes what information we collect, how we use it, and what choices you have.
          </p>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {SECTIONS.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#e3ecdf] p-6 sm:p-8">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#f3f7f1] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-[#476a39]">{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <h2 className="text-lg font-semibold text-[#2f4328]">{s.title}</h2>
                </div>
                <p className="text-sm text-[#4d483f] leading-relaxed ml-9">{s.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#f3f7f1] rounded-xl border border-[#e3ecdf] p-6 text-center">
            <p className="text-sm text-[#2f4328] font-medium">Have questions about privacy?</p>
            <p className="text-xs text-[#615b4f] mt-1">Email us at privacy@smartkrishi.app — we respond within 48 hours.</p>
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 sm:px-6 bg-[#141e12]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
              <Sprout className="w-5 h-5 text-[#7ea26d]" />
              <span className="text-sm font-semibold text-[#c7d9bf]">Smart Krishi Sahayak</span>
            </button>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/about')} className="text-xs text-[#7a7364] hover:text-[#c7d9bf] transition-colors">About</button>
              <button onClick={() => navigate('/terms')} className="text-xs text-[#7a7364] hover:text-[#c7d9bf] transition-colors">Terms</button>
              <button onClick={() => navigate('/register')} className="text-xs text-[#7a7364] hover:text-[#c7d9bf] transition-colors">Sign Up</button>
            </div>
            <p className="text-xs text-[#615b4f]">&copy; 2026 Smart Krishi Sahayak. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
