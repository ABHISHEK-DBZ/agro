import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

console.log('🌾 Starting Smart Krishi Sahayak...');

const container = document.getElementById('root');

if (container) {
  try {
    console.log('🔧 Creating React root...');
    
    // Ensure only one app instance
    if (container.children.length > 1) {
      // Remove all children except loading screen
      const loadingScreen = document.getElementById('loading-screen');
      container.innerHTML = '';
      if (loadingScreen) {
        container.appendChild(loadingScreen);
      }
    }
    
    // Hide the loading screen with smooth transition
    const hideLoadingScreen = () => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          loadingScreen.remove();
        }, 500);
      }
      // Enable body scroll
      document.body.style.overflow = 'auto';
      document.body.classList.remove('loading');
    };
    
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Hide loading screen after app renders
    setTimeout(hideLoadingScreen, 1500);
    
    console.log('✅ Smart Krishi Sahayak loaded successfully!');
  } catch (error) {
    console.error('❌ Error loading app:', error);
    
    // Remove loading screen on error
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.remove();
    }
    
    container.innerHTML = `
      <div style="text-align: center; padding: 50px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%); color: #333; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0;">
        <h2 style="color: #16a34a; margin-bottom: 20px; font-size: 2rem;">🌾 Smart Krishi Sahayak</h2>
        <p style="color: #dc2626; margin: 20px 0; background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="location.reload()" style="background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 15px 30px; border: none; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3); transition: all 0.3s ease;">
          🔄 Reload Application
        </button>
      </div>
    `;
  }
} else {
  console.error('❌ No root container found');
}
