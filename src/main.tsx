import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n/config';

console.log('🌾 Starting Smart Krishi Sahayak...');

const container = document.getElementById('root');

if (container) {
  try {
    console.log('🔧 Creating React root...');
    
    // Hide the loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
    console.log('✅ Smart Krishi Sahayak loaded successfully!');
  } catch (error) {
    console.error('❌ Error loading app:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 50px; background: #f0f8ff; color: #333; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h2 style="color: #16a34a; margin-bottom: 20px;">🌾 Smart Krishi Sahayak</h2>
        <p style="color: red; margin: 20px 0;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="location.reload()" style="background: #16a34a; color: white; padding: 15px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          🔄 Reload App
        </button>
      </div>
    `;
  }
} else {
  console.error('❌ No root container found');
}
