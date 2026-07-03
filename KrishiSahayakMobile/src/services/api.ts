// API Service - Core HTTP client
// Screens use direct fetch() calls for simplicity.
// In production, all API calls should be routed through this service.

const API_BASE = __DEV__
  ? 'http://localhost:5000/api'
  : 'https://smart-krishi-backend.azurewebsites.net/api';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export default apiRequest;
