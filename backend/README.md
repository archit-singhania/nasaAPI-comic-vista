# 🛰️ NASA AetherLink — Backend

Welcome to the **backend** of this project — a modular Express.js server that acts as a middleware API between the frontend and NASA’s public APIs. It simplifies cross-origin issues, hides API keys, unifies data formats, and enables future scalability for caching, logging, and analytics.

---

## ⚙️ Tech Stack

* **Node.js** + **Express.js**
* **Axios** for API communication
* **dotenv** for environment configuration
* **CORS** middleware
* **Jest** + **Supertest** + **Nock** for testing

---

## 📁 Project Structure

```
backend/
├── routes/                     # Route handlers organized per NASA API
│   ├── apod.js
│   ├── marsRover.js
│   ├── neows.js
│   ├── donki.js
│   ├── earth.js
│   ├── eonet.js
│   ├── epic.js
│   ├── exoplanet.js
│   ├── osdr.js
│   ├── insight.js
│   ├── imageLibrary.js
│   ├── techTransfer.js
│   ├── tle.js
│   ├── wmts.js
│   ├── ssc.js
│   ├── ssdcneos.js
│   └── techport.js
│
├── controllers/                # Optional: route logic abstraction
│   └── [Optional controller files]
│
├── services/                   # Axios wrappers & data processing for NASA APIs
│   └── nasaService.js
│
├── utils/                      # Utility functions (date parsing, etc.)
│   └── helpers.js
│
├── .env                        # Sensitive configs (e.g., NASA_API_KEY)
├── .gitignore                  # Node_modules, .env, logs, etc.
├── index.js                    # Entry point - sets up and runs server
├── package.json                # Dependencies and scripts
└── README.md                   # Backend documentation
```

---

## 🌐 Running Locally

```bash
# Install dependencies
cd backend 
npm install

# Start the Server (Development Mode with Nodemon)
npm run dev
# or
node daemon index.js
```

Server will run by default on `http://localhost:5000`

---

## 🔒 Environment Variables

Create a `.env` file in the `backend/` folder:

```
NASA_API_KEY=your_nasa_api_key
PORT=5000
```

> ⚠️ Ensure `.env` is listed in `.gitignore`

---

## 🧪 Testing Setup

We use `Jest` + `Supertest` + `Nock` for mocking external NASA APIs:

```bash
# Run backend test suite
npx jest

# Run with coverage
npx jest --coverage
```

Tests are written to validate route behavior, mock external API responses, and confirm error handling.

---

## ✅ Completed Routes

| Route                      | NASA API Endpoint               | Status        |
| -------------------------- | ------------------------------- | ------------- |
| /apod                      | planetary/apod                  | ✅ Done        |
| /marsRover                 | mars-photos/api/v1/rovers       | ✅ Done        |
| /neows                     | neo/rest/v1/feed                | ✅ Done        |
| /donki                     | DONKI endpoints                 | ✅ Done        |
| /earth                     | imagery, assets                 | ✅ Done        |
| /eonet                     | eonet.gsfc.nasa.gov             | ✅ Done        |
| /epic                      | EPIC image archive              | ✅ Done        |
| /insight                   | Insight Mars weather            | ✅ Done        |
| /osdr                      | Open Source Data Repository     | ✅ Done        |
| /imageLibrary              | NASA Image & Video Library      | ⚠️ WIP        |
| /techTransfer              | techtransfer                    | ⚠️ WIP        |
| /tle                       | TLE via external sources        | ✅ Done        |
| /wmts                      | Mars/Vesta tile layers          | ⚠️ WIP        |
| /ssc, /ssdcneos, /techport | Static/coming soon placeholders | ⏳ Coming Soon |

---

## 🧠 Future Improvements

* [ ] Rate limiting to avoid overuse
* [ ] Data caching with TTL
* [ ] Retry logic for transient NASA API errors
* [ ] Central error handler middleware

---

## 🚀 Deployment

* ✅ Backend is live and deployed via Render:
👉 https://nasaapi-comic-vista-backend.onrender.com

---

## 🧑‍💻 Creator

Built with precision by [Archit Singhania](https://github.com/archit-singhania)