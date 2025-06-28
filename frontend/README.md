# 🌌 NASA AetherLink — Frontend

Welcome to the **frontend** of this project — a modern, interactive React application that visualizes data from NASA’s public APIs. This frontend delivers a seamless, visually captivating user experience across various NASA datasets including APOD, Mars Rover photos, Near-Earth Asteroids, and more.

---

## 🚀 Tech Stack

> ⚙️ This project consists of a **React frontend** powered by **Express.js backend** (not Vite for backend).

* **React 18** with **Express**
* **Tailwind CSS** for styling
* **React Router v6** for routing
* **Axios** for HTTP requests
* **Framer Motion** for animations
* **Chart.js** and **Leaflet** for data visualizations
* **Cypress** & **Jest + React Testing Library** for testing

---

## 📁 Project Structure

```
frontend/
├── public/                     # Static HTML and assets
├── src/
│   ├── api/                   # API calls to backend (Axios instances and API handlers)
│   │   └── nasaAPI.js
│   ├── assets/                # Images, icons, and branding
│   ├── components/            # All reusable visual components
│   │   ├── common/            # Navbar, Footer, Loader, ErrorBoundary
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── ApodViewer.jsx        # Astronomy Picture of the Day
│   │   ├── MarsRoverGallery.jsx  # Mars Rover photo gallery
│   │   ├── NeoWsChart.jsx        # Asteroid data visualization
│   │   ├── EpicViewer.jsx        # Earth imagery
│   │   ├── EarthMap.jsx          # Earth tiles or satellite images
│   │   ├── DonkiEvents.jsx       # Space weather events timeline
│   │   ├── EonetMap.jsx          # Disaster tracker map
│   │   ├── InsightWeather.jsx    # Mars weather dashboard
│   │   ├── ExoplanetTable.jsx    # List/filter exoplanets
│   │   ├── ImageSearch.jsx       # NASA image and video library
│   │   ├── TechTransferList.jsx  # Searchable tech transfer DB
│   │   ├── TleVisualizer.jsx     # Visualizer for orbit data
│   │   ├── WmtsMap.jsx           # Tile-based space map
│   │   └── ...
│   ├── pages/                 # Route-level pages
│   │   ├── Home.jsx
│   │   ├── Apod.jsx
│   │   ├── MarsRover.jsx
│   │   ├── Asteroids.jsx
│   │   ├── Epic.jsx
│   │   ├── Earth.jsx
│   │   ├── Donki.jsx
│   │   ├── Eonet.jsx
│   │   ├── Insight.jsx
│   │   ├── Exoplanet.jsx
│   │   ├── MediaLibrary.jsx
│   │   ├── TechTransfer.jsx
│   │   ├── Tle.jsx
│   │   ├── Wmts.jsx
│   │   ├── NotFound.jsx
│   │   └── ComingSoon.jsx
│   ├── styles/                # Global + theme styles
│   │   ├── variables.css
│   │   └── global.css
│   ├── App.jsx                # Router + layout wrapper -> React entry (Express serves this)
│   ├── main.jsx              
│   └── utils/                 # Constants, helpers
│       ├── helpers.js
│       └── constants.js
├── cypress/
│   ├── e2e/
│   │   ├── apod.cy.js
│   │   ├── marsRover.cy.js
│   │   ├── asteroids.cy.js
│   │   ├── epic.cy.js
│   │   ├── earth.cy.js
│   │   ├── donki.cy.js
│   │   ├── eonet.cy.js
│   │   ├── insight.cy.js
│   │   ├── exoplanet.cy.js
│   │   ├── mediaLibrary.cy.js
│   │   ├── techTransfer.cy.js
│   │   ├── tle.cy.js
│   │   ├── wmts.cy.js
│   │   └── comingSoon.cy.js
│   ├── support/
│   │   ├── commands.js
│   │   └── e2e.js
│   └── cypress.config.js
├── .env                      # FRONTEND_API_BASE, NASA_API_KEY (optional kept here)
├── package.json
└── README.md
```

---

## 🧐 Available Pages (Under `/src/pages`)

| Page              | Status          | Notes                             |
| ----------------- | --------------- | --------------------------------- |
| Home              | ⚙️ In Progress  | Motion left-to-right to be tested |
| APOD              | ✅ Implemented   | 📦 Testing pending                |
| Mars Rover        | ✅ Implemented   | 📦 Testing pending                |
| Asteroids (NeoWs) | ✅ Implemented   | 📦 Testing pending                |
| EONET             | ✅ Implemented   | 📦 Testing pending                |
| TLE               | ✅ Implemented   | 📦 Testing pending                |
| DONKI             | ✅ Implemented   | 📦 Testing pending                |
| Earth             | ✅ Implemented   | 📦 Testing pending                |
| EPIC              | ✅ Implemented   | 🗼 UI beautification needed       |
| Insight           | ✅ Implemented   | 🗼 UI beautification needed       |
| OSDR              | ✅ Implemented   | 🗼 UI beautification needed       |
| Image/Video Lib   | ⚠️ Issues exist | 🔧 Not working properly           |
| Tech Transfer     | ⚠️ Issues exist | 🔧 Not working properly           |
| WMTS              | ⚠️ Issues exist | 🔧 Not working properly           |
| Exoplanet         | ⚠️ Issues exist | 🔧 Not working properly           |
| Coming Soon       | ⏳ Planned       | TechPort, SSC, SSDCNEOS           |


**⚙️ Setup Instructions**

```bash
# 1️⃣ Install Dependencies
cd frontend
npm install

# 2️⃣ Run Development Server
npm start
```

---> Frontend runs on http://localhost:3000

**🧪 Testing Guidelines**
Unit & Component Tests (Jest + React Testing Library)
```bash
npm run test
```

End-to-End Tests (Cypress)
```bash
# Run Cypress in interactive mode:
npx cypress open
# Or headless mode:
npx cypress run
```

**🚀 Deployment**
✅ Frontend is deployed and live:
👉 https://nasa-api-comic-vista.vercel.app/

## 🧑‍💻 Creator

Built with precision by [Archit Singhania](https://github.com/archit-singhania)