# 🌾 Smart Krishi Sahayak (स्मार्ट कृषि सहायक)

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD627)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![i18n](https://img.shields.io/badge/i18n-0984e3?style=for-the-badge&logo=translation&logoColor=white)](https://react.i18next.com/)

**Smart Krishi Sahayak** is a premium, state-of-the-art agricultural web application designed to empower farmers with real-time agronomic data, community collaboration, and AI-driven agricultural consulting. The app features a professional, earth-toned dark/light design system, fully responsive layouts, real-time peer-to-peer telemetry simulations, and complete localization (English & Hindi).

🌐 **Live Website:** [https://smart-krishi-sahayak-6871c.web.app](https://smart-krishi-sahayak-6871c.web.app)

---

## 🌟 Key Features

### 🤖 1. AI Agriculture Assistant (Cascading Logic)
* **Dual-Mode Intelligence:** Queries online models via OpenRouter (automatically selecting active free endpoints like Gemma, Llama, or Qwen) first. If offline or if the API limits are reached, it cascades seamlessly to a local database of 20+ topics, displaying a clear "Offline mode" fallback indicator.
* **Speech Synthesis:** Text-to-speech engine lets farmers listen to answers in English or Hindi with a single click.
* **Agri Suggestions:** Interactive query chips for quick consultations about crop protection, weather precautions, and soil diagnostics.

### 👥 2. Real-Time Farmer Community Hub
* **Bento Grid Dashboard:** Displays live discussions, solved status tags, active pest outbreak alerts, and real-time cooperative machinery rental dispatch metrics.
* **Farmer Groups (`/groups`):** Connect with other farmers through public/private categories (Crop-Specific, Equipment, Market, general). Fully synced in real-time.
* **Interactive Polls (`/polls`):** Vote on agricultural decisions with animated vote progress bars that sync instantly across all browser sessions.
* **Gamified Leaderboard (`/leaderboard`):** Encourages community help by ranking contributors on a podium (1st, 2nd, 3rd) with custom trophies and dynamic reputation levels.
* **Direct Messaging (`/messages`):** Real-time private chat sidebar featuring unread count badges and online/offline status indicators.
* **Map View (`/map`):** Interactive SVG layout projecting farmers, posts, groups, and emergency pest alerts onto their geographic coordinates.

### 🌦️ 3. Live Mandi Prices & Weather Forecast
* **Advanced Mandi Rates:** Detailed commodity pricing tables with state-wise and crop-wise filters, showing daily market highs/lows and price differentials.
* **7-Day Weather Forecasting:** Location-based reports (humidity, wind speed, rainfall probability) combined with automated weather precautions for active seasonal crops.

### 🚜 4. IoT Soil Telemetry Simulation
* **Cooperative Swarm Telemetry:** Connects to simulated farm machinery (drones, tractors) showing live battery levels and hourly rental booking dispatches.
* **Soil Testing Diagnostics:** Logs and tracks N-P-K soil nutrients, pH levels, and organic carbon with automated local laboratory recommendations.

---

## ⚙️ Technologies & Libraries

* **Core Framework:** React 18, Vite, TypeScript
* **Styling & Design:** Tailwind CSS (Custom HSL color system matching forest greens and warm ambers), Lucide React Icons
* **Real-time Engine & Backend:** Firebase v10 (Auth, Firestore, Cloud Storage), Firestore Rules (Secure access patterns)
* **Internationalization:** React i18next (JSON namespaces for dynamic English/Hindi switching)
* **Routing:** React Router DOM v6
* **Notifications:** React Hot Toast

---

## 📁 Project Architecture

```
agro/
├── public/                 # Assets (Generated Farmland Mockups & Walkthroughs)
├── firestore.rules        # Hardened security rules (Owner-only updates/deletes)
├── firebase.json           # Firebase deploy configuration (Hosting/Rules)
├── functions/              # Cloud Functions codebase (TypeScript)
└── src/
    ├── components/         # Reusable design components (ui/ buttons, modals, tabs)
    ├── contexts/           # Global contexts (Auth, Language switcher, Settings)
    ├── hooks/              # Custom hooks (Swarm telemetry, Local weather)
    ├── i18n/               # Localization locales (en.json, hi.json translations)
    ├── pages/              # Main Feature Panels
    │   ├── CommunityDashboard.tsx
    │   ├── GroupsPage.tsx
    │   ├── GroupDetailPage.tsx
    │   ├── LeaderboardPage.tsx
    │   ├── PollsPage.tsx
    │   ├── MessagesPage.tsx
    │   ├── MapViewPage.tsx
    │   ├── HomePage.tsx    # Premium Asymmetric Bento-grid Landing page
    │   └── Weather.tsx
    ├── services/           # Service layer API adapters (OpenRouter, Community, db)
    ├── App.tsx             # Route manager
    └── index.css           # Custom CSS variables, dark-mode styling tokens
```

---

## 🚀 Installation & Setup

### 1. Clone & Install
```bash
git clone https://github.com/ABHISHEK-DBZ/agro.git
cd agro
npm install
```

### 2. Configure Environment variables
Create a `.env` file in the root directory:
```env
# Frontend API endpoint for Mandi prices & Weather
VITE_API_BASE_URL=http://localhost:5000/api

# OpenRouter key & default free model
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_OPENROUTER_MODEL=openrouter/free

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=smart-krishi-sahayak-6871c
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Locally
```bash
# Start Vite development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🛡️ Security Configuration

Firestore Database uses hardened rules in [firestore.rules](firestore.rules):
* **Owner-Only Write Access:** Updates and deletes for posts (`community_posts`), replies (`community_replies`), and groups (`farmer_groups`) are strictly restricted to the user whose authenticated UID matches the document creator (`farmerId` / `createdBy`).
* **Public Reads:** Public read access is permitted on discussions to encourage collaborative learning.
* **Telemetry & Counters:** Atomic increments (likes, views, member listings) are exposed without granting write permissions on sensitive metadata fields.

---

## 📞 Support & Contacts

* **Author:** Abhishek
* **GitHub Profile:** [ABHISHEK-DBZ](https://github.com/ABHISHEK-DBZ)
* **Email:** abhibro936@gmail.com
* **Phone:** +91-7841938644
