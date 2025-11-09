# 🌾 Smart Krishi Sahayak Backend API

Modern, scalable REST API for Smart Krishi Sahayak agriculture platform built with Express.js and Firebase.

## 🚀 Features

- ✅ **RESTful API** with Express.js
- 🔥 **Firebase Admin SDK** integration for Firestore
- 🌤️ **Weather API** integration with OpenWeatherMap
- 📊 **Market Prices** API for agricultural commodities
- 🌾 **Crops Information** database
- 🤖 **AI Agent** for farming queries
- 🔒 **Security** with Helmet, CORS, Rate Limiting
- 📦 **Compression** for optimized responses
- 📝 **Logging** with Morgan
- ⚡ **Caching** for improved performance

---

## 📋 Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Firebase Project** (optional, has fallback mode)
- **OpenWeather API Key** (optional)

---

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development

# OpenWeather API (Get from https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_api_key_here

# Firebase Admin SDK (Two options)

# Option 1: Service Account File
# Download serviceAccountKey.json from Firebase Console
# Place it in the server directory

# Option 2: Environment Variables
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-app.web.app
```

### 3. Firebase Setup (Optional)

#### Download Service Account Key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings → Service Accounts
3. Click "Generate New Private Key"
4. Save as `serviceAccountKey.json` in the `server` directory

**⚠️ Important:** Add `serviceAccountKey.json` to `.gitignore`

---

## 🚀 Running the Server

### Development Mode (with auto-reload):

```bash
npm run dev
```

### Production Mode:

```bash
npm start
```

Server will start on `http://localhost:5000`

---

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api`

### 1. Health Check

**GET** `/api/health`

Response:
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2025-01-09T10:00:00.000Z",
  "environment": "development",
  "firebase": "connected"
}
```

---

### 2. Crops API

#### Get All Crops

**GET** `/api/crops`

Response:
```json
[
  {
    "id": "wheat",
    "name": { "en": "Wheat", "hi": "गेहूं" },
    "season": "Rabi",
    "duration": "120-150 days",
    "soilType": "Loamy soil",
    "climate": "Cool and moist",
    "temperature": "15-25°C",
    "rainfall": "50-75 cm",
    "majorStates": ["Punjab", "Haryana", "UP"],
    "bestPractices": {
      "en": ["Sow in Nov-Dec", "Use certified seeds"],
      "hi": ["नवंबर-दिसंबर में बुवाई", "प्रमाणित बीज उपयोग करें"]
    },
    "diseases": ["Rust", "Smut", "Blight"],
    "avgYield": "3-4 tons/hectare"
  }
]
```

#### Get Crop by ID

**GET** `/api/crops/:id`

Example: `/api/crops/wheat`

#### Add New Crop (Admin)

**POST** `/api/crops`

Body:
```json
{
  "name": { "en": "Maize", "hi": "मक्का" },
  "season": "Kharif",
  "duration": "90-120 days",
  ...
}
```

---

### 3. Weather API

#### Get Current Weather

**GET** `/api/weather/current?lat=28.6139&lon=77.2090`

Query Parameters:
- `lat` (required): Latitude
- `lon` (required): Longitude

Response:
```json
{
  "coord": { "lon": 77.21, "lat": 28.61 },
  "weather": [{ "main": "Clear", "description": "clear sky" }],
  "main": {
    "temp": 25.5,
    "feels_like": 24.2,
    "humidity": 45,
    "pressure": 1013
  },
  "wind": { "speed": 3.5 },
  "name": "New Delhi"
}
```

#### Get 5-Day Forecast

**GET** `/api/weather/forecast?lat=28.6139&lon=77.2090`

#### Get Air Quality

**GET** `/api/weather/air-quality?lat=28.6139&lon=77.2090`

#### Subscribe to Weather Alerts

**POST** `/api/weather/alert`

Body:
```json
{
  "lat": 28.6139,
  "lon": 77.2090,
  "userId": "user123",
  "alertTypes": ["rain", "storm", "frost"]
}
```

---

### 4. Market Prices API

#### Get Market Prices

**GET** `/api/market/prices?state=Punjab&commodity=Wheat&limit=10`

Query Parameters (all optional):
- `state`: State name
- `district`: District name
- `commodity`: Commodity name
- `limit`: Number of results (default: 10)

Response:
```json
[
  {
    "id": "1",
    "commodity": "Wheat",
    "state": "Punjab",
    "district": "Ludhiana",
    "market": "Ludhiana Mandi",
    "minPrice": 2400,
    "maxPrice": 2600,
    "modalPrice": 2500,
    "unit": "quintal",
    "date": "2025-01-09T10:00:00.000Z",
    "variety": "PBW 343"
  }
]
```

#### Get Trending Commodities

**GET** `/api/market/trending`

Response:
```json
{
  "trending": [
    {
      "name": "Wheat",
      "priceChange": "+5%",
      "currentPrice": 2500
    }
  ],
  "updatedAt": "2025-01-09T10:00:00.000Z"
}
```

#### Get States List

**GET** `/api/market/states`

#### Get Commodities List

**GET** `/api/market/commodities`

#### Set Price Alert

**POST** `/api/market/price-alert`

Body:
```json
{
  "userId": "user123",
  "commodity": "Wheat",
  "targetPrice": 2600,
  "condition": "above"
}
```

---

### 5. AI Agent API

#### Query AI Agent

**POST** `/api/ai/query`

Body:
```json
{
  "query": "How to grow wheat?"
}
```

Response:
```json
{
  "query": "How to grow wheat?",
  "response": "Wheat is a Rabi crop best sown in November-December...",
  "timestamp": "2025-01-09T10:00:00.000Z"
}
```

---

## 🔒 Security Features

### 1. Helmet.js
- XSS Protection
- HSTS
- Frame Options
- Content Security Policy

### 2. CORS
- Configurable allowed origins
- Credentials support

### 3. Rate Limiting
- 100 requests per 15 minutes per IP
- Stricter limits on auth endpoints

### 4. Input Validation
- Request size limits (10MB)
- Query parameter validation

---

## 📦 Caching

### Weather Data Cache
- Duration: 30 minutes
- Reduces API calls to OpenWeather
- In-memory cache with Map

### Implementation:
```javascript
const weatherCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
```

---

## 🧪 Testing

### Manual Testing with curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Get crops
curl http://localhost:5000/api/crops

# Get weather
curl "http://localhost:5000/api/weather/current?lat=28.6139&lon=77.2090"

# Get market prices
curl "http://localhost:5000/api/market/prices?state=Punjab"

# AI query
curl -X POST http://localhost:5000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query":"How to grow rice?"}'
```

### Testing with Postman:

1. Import the API collection
2. Set base URL: `http://localhost:5000/api`
3. Test each endpoint

---

## 🚀 Deployment

### Railway.app

1. Create account on [Railway.app](https://railway.app/)
2. Connect GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically on push to main

### Vercel

```bash
npm install -g vercel
vercel
```

### Render

1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

---

## 📊 Project Structure

```
server/
├── config/
│   └── firebase-admin.js      # Firebase Admin SDK configuration
├── routes/
│   ├── crops.js               # Crops API routes
│   ├── weather.js             # Weather API routes
│   └── market.js              # Market prices routes
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore file
├── package.json               # Dependencies and scripts
├── server.js                  # Main server file
└── README.md                  # This file
```

---

## 🔧 Dependencies

### Production
- `express` - Web framework
- `firebase-admin` - Firebase Admin SDK
- `axios` - HTTP client
- `cors` - CORS middleware
- `helmet` - Security middleware
- `compression` - Response compression
- `express-rate-limit` - Rate limiting
- `morgan` - Logging middleware
- `dotenv` - Environment variables

### Development
- `nodemon` - Auto-reload in development

---

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |
| `OPENWEATHER_API_KEY` | OpenWeather API key | No |
| `FIREBASE_PROJECT_ID` | Firebase project ID | No* |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | No* |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | No* |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | No |

*Required only if using Firebase integration

---

## 📝 Logging

Logs include:
- HTTP request logs (Morgan)
- Firebase connection status
- Weather API cache hits
- Error logs

Example output:
```
========================================
🌾 Smart Krishi Sahayak Backend API
========================================
✅ Server running on http://localhost:5000
📊 Environment: development
🔥 Firebase: Connected
========================================
```

---

## ⚠️ Error Handling

### Common Error Codes:

- `400` - Bad Request (missing parameters)
- `401` - Unauthorized (invalid token)
- `404` - Not Found (endpoint doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (Firebase/Weather API down)

### Error Response Format:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

---

## 📄 License

ISC License - See LICENSE file for details

---

## 👨‍💻 Author

ABHISHEK-DBZ

---

## 🔗 Links

- [Frontend Repository](https://github.com/ABHISHEK-DBZ/agro)
- [Firebase Console](https://console.firebase.google.com/)
- [OpenWeather API](https://openweathermap.org/api)
- [Railway.app](https://railway.app/)

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact: [GitHub Profile](https://github.com/ABHISHEK-DBZ)

---

**Built with ❤️ for Indian Farmers**
