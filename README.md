# 🌌 NASA ☄️🔭AetherLink🧑‍🚀🚀🛰️ - Full Stack Space Exploration Platform

**AetherLink** is a full-stack project that visualizes data from NASA’s vast array of public APIs using React and Express. This interactive web application allows users to explore real-time space data — from Mars Rover photos and exoplanets to asteroid trajectories, satellite orbits, and Earth imagery.

---

## 🚀 Tech Stack

| Layer     | Stack / Tools                                                  |
|-----------|----------------------------------------------------------------|
| Frontend  | React, Vite, Tailwind CSS, Chart.js, Leaflet, Framer Motion    |
| Backend   | Node.js, Express.js, Axios, dotenv                             |
| Testing   | Jest, React Testing Library, Cypress, Supertest, Nock          |
| Dev Tools | Git, Vercel, Render, ESLint, Prettier, Google Cloud Platformm  |

---

## 🗂️ Repository Structure

```txt
nasa-cosmic-vista/
├── frontend/               # React app for NASA API visualization
│   ├── src/                # Components, pages, API calls, styling
│   ├── cypress/            # E2E tests for user journeys
│   └── README.md           # Frontend documentation
│
├── backend/                # Express.js API middleware for NASA APIs
│   ├── routes/             # Modular NASA API route handlers
│   ├── services/           # Axios wrappers for external APIs
│   └── README.md           # Backend documentation
│
├── .gitignore
├── README.md               # Root README (you’re here)
└── LICENSE
```

---

## 💡 Key Features

- 📸 Astronomy Picture of the Day (APOD)
- 🤖 Mars Rover Gallery by sol or Earth date
- ☄️ Asteroid Tracker via NASA NeoWs API
- 🔥 Natural Event Tracker (EONET)
- 🌍 Earth & EPIC satellite image viewer
- 🌪️ DONKI — space weather alert timeline
- 📊 TLE orbital data viewer
- 🌡️ Mars weather station (Insight)
- 🔭 Exoplanet explorer
- 🧠 Technology Transfer search
- 🗺️ WMTS tile-based map viewer
- 📚 NASA Image & Video Search

---

## 🧪 Testing Strategy

| Layer     | Tools                     | Command                       |
|-----------|---------------------------|-------------------------------|
| Frontend  | Jest + RTL                | `npm run test`                |
| Frontend  | Cypress (E2E)             | `npx cypress open`            |
| Backend   | Jest + Supertest + Nock   | `npx jest` / `--coverage`     |

---

## 🔧 Setup Instructions

### Backend

```bash
cd backend
npm install
cp .env.example .env    # Add NASA_API_KEY
npm run dev             # or node index.js
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env    # Set Express Backend URL (usually http://localhost:5000/api)
npm start
```

## 🧩 Recommended Deployment

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Secure .env files for both frontend and backend
- CORS configured to allow seamless cross-origin requests

## 🟡 Known Issues & Pending

- Some pages under UI refinement: EPIC, Insight, OSDR
- Features in-progress: Image Library, Tech Transfer, WMTS
- Coming Soon pages: TechPort, ssdcneos, ssc


## 🔗 Live Deployment

- > Frontend Live: https://nasa-api-comic-vista.vercel.app
- > Backend Live: https://nasaapi-comic-vista-backend.onrender.com

## 📄 License

This project is open-source under the MIT License.

## 👨‍💻 Author

- Developed with passion for space, science, and software by Archit Singhania
- “Exploration is wired into our brains. If we can see the horizon, we want to know what’s beyond.” — Buzz Aldrin