import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Sprout } from 'lucide-react';

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
    title: 'Acceptance of Terms',
    content: 'By creating an account or using Smart Krishi Sahayak ("the Platform"), you agree to these Terms and Conditions. If you do not agree, please do not use the service. These terms apply to all users, visitors, and anyone who accesses the Platform.'
  },
  {
    title: 'Eligibility',
    content: 'You must be at least 13 years old to use this service. If you are under 18, you must have parental or guardian consent. By using the Platform, you represent that you meet these eligibility requirements. The Platform is designed for use in India and may not function correctly in other regions.'
  },
  {
    title: 'Account Registration',
    content: 'You are responsible for maintaining the confidentiality of your login credentials. You must provide accurate, current, and complete information during registration. You are responsible for all activity under your account. Notify us immediately at support@smartkrishi.app if you suspect unauthorized access. We reserve the right to suspend accounts that violate these terms.'
  },
  {
    title: 'Service Description',
    content: 'Smart Krishi Sahayak provides agricultural information tools including weather forecasts, crop management suggestions, disease detection, market prices, and AI-powered assistance. All information is provided for informational purposes only and does not constitute professional agricultural advice. Farming decisions remain your sole responsibility.'
  },
  {
    title: 'Limitation of Liability',
    content: 'Smart Krishi Sahayak and its team shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the Platform. This includes but is not limited to crop loss, financial loss, or damage resulting from following or not following recommendations provided by the Platform. We provide tools to inform your decisions, not to make them for you.'
  },
  {
    title: 'Intellectual Property',
    content: 'The Platform, its design, logo, code, and content are owned by Smart Krishi Sahayak. You may not copy, modify, distribute, or reverse-engineer any part of the Platform without explicit written permission. User-uploaded content (crop photos, field data) remains your property, but you grant us a license to use it for improving our AI models.'
  },
  {
    title: 'Acceptable Use',
    content: 'You agree not to: misuse the Platform for any illegal purpose; upload malicious code or attempt to hack the system; use automated bots or scrapers; impersonate other users; share false or misleading information about crop prices or diseases; or use the service in any way that could harm farmers or agricultural markets.'
  },
  {
    title: 'Service Availability',
    content: 'We strive for 99.9% uptime but cannot guarantee uninterrupted service. The Platform may be unavailable for scheduled maintenance, emergency fixes, or due to factors beyond our control (natural disasters, network outages, etc.). We are not liable for losses resulting from service unavailability. We will notify users in advance of scheduled maintenance via the app.'
  },
  {
    title: 'Third-Party Services',
    content: 'The Platform integrates with third-party services including Firebase (authentication/database), OpenRouter (AI processing), and weather data providers. We are not responsible for the availability or accuracy of third-party services. These services have their own terms and privacy policies.'
  },
  {
    title: 'Modification of Terms',
    content: 'We reserve the right to modify these terms at any time. Changes will be posted on this page and notified via email to registered users. Continued use of the Platform after changes constitutes acceptance of modified terms. If you disagree with changes, you must stop using the service and close your account.'
  },
  {
    title: 'Termination',
    content: 'You may close your account at any time from the Settings page. We may suspend or terminate accounts that violate these terms. Upon termination, your access to the Platform ends and your personal data will be deleted within 30 days. Sections on Limitation of Liability and Intellectual Property survive termination.'
  },
  {
    title: 'Governing Law',
    content: 'These terms are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of courts in New Delhi, India. We encourage you to reach out to us first at support@smartkrishi.app before initiating any legal proceedings.'
  },
];

const TermsConditions = () => {
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
              <FileText className="w-5 h-5 text-[#476a39]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#476a39] uppercase tracking-[0.12em]">Legal</span>
              <h1 className="text-3xl sm:text-4xl font-semibold text-[#283823] mt-1 tracking-[-0.02em]">Terms & Conditions</h1>
              <p className="text-sm text-[#7a7364] mt-1">Last updated: June 1, 2026</p>
            </div>
          </div>
          <p className="text-sm text-[#4d483f] leading-relaxed max-w-2xl mt-4">
            These terms govern your use of Smart Krishi Sahayak. Please read them carefully before using the Platform.
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
              <button onClick={() => navigate('/privacy')} className="text-xs text-[#7a7364] hover:text-[#c7d9bf] transition-colors">Privacy</button>
              <button onClick={() => navigate('/register')} className="text-xs text-[#7a7364] hover:text-[#c7d9bf] transition-colors">Sign Up</button>
            </div>
            <p className="text-xs text-[#615b4f]">&copy; 2026 Smart Krishi Sahayak. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsConditions;
