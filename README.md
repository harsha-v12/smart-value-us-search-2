# Smart Value Search 2 - Tracking & Traffic Routing Backend

Dedicated Node.js backend for parameter validation, anti-bot/macro rule targeting, dynamic traffic routing, and serving the `/us/search-2/` landing page with dynamic tracking links.

---

## 🎯 Features

- **Landing Page Route (`GET /us/search-2/` or `GET /`)**:
  - **Missing / Empty / Macro Parameters** $\rightarrow$ Automatically 302 redirects to Fallback (`openvista.live`).
  - **Valid Parameters** $\rightarrow$ Stays on the landing page, rendering the age selector buttons (`18-25`, `26-35`, `36-45`, `46-55`, `56+`) wired directly to the verified primary tracking link (`rutorbit.com`).
- **4-Point Quality & Targeting Rules**:
  - **Condition 1 (Click ID)**: `fbclid` (Facebook) or `ttclid` (TikTok) must be present, non-empty, and free of unresolved macros.
  - **Condition 2 (`p2`)**: Must start with an allowed prefix (`US-hs-Bv` or `US-TIK-HI-RV`).
  - **Condition 3 (`p15`)**: Secondary campaign tag must start with an allowed prefix (`US-hs-Bv` or `US-TIK-HI-RV`).
  - **Condition 4 (Channel Flag)**: TikTok requires `tk=1`; Facebook requires `fb=1`.
- **Target Tracking Link Injection**:
  - Injects channel internal identifier `p11` (`1253687` for Facebook, `2876212` for TikTok) placed strictly before `p15`.
- **Direct 302 Redirect Support** (`GET /click` or `GET /r`).
- **REST API Support** (`GET /api/v1/tracking/resolve`).
- **Environment Configurable**: All base URLs, fallback links, and prefixes are configurable via `.env`.

---

## 📁 Repository Structure

```
smart-value-search-2/
├── src/
│   ├── config/
│   │   └── config.js              # Environment configuration
│   ├── controllers/
│   │   └── trackingController.js  # Handles landing page, redirects, and API
│   ├── rules/
│   │   └── ruleEngine.js          # 4-tier targeting and anti-bot rule engine
│   ├── routes/
│   │   └── trackingRoutes.js      # Express route definitions
│   ├── services/
│   │   └── trackingService.js     # URL builder & destination resolver
│   ├── views/
│   │   └── landingPage.js         # Landing page HTML renderer
│   └── app.js                     # Express application setup
├── tests/
│   ├── ruleEngine.test.js         # Unit tests
│   └── e2e.test.js                # End-to-End integration tests
├── .env.example                   # Environment configuration template
├── .env                           # Local environment configuration
├── .gitignore
├── package.json
├── README.md
└── server.js                      # Application entry point
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Server
- **Production mode**:
  ```bash
  npm start
  ```
- **Development mode**:
  ```bash
  npm run dev
  ```

### 3. Run Automated Tests
```bash
npm test
```

---

## 📡 Routes Reference

### 1. Landing Page (`GET /us/search-2/` or `GET /`)
- **When parameters are invalid or empty**:
  ```bash
  curl -i "http://localhost:3003/us/search-2/?fbclid=test_fb&p2=&p15=US-hs-Bv-1&fb=1"
  ```
  $\rightarrow$ Redirects (302) to `https://openvista.live/?clk=test_fb&zid=9482163&src=test_fb`
- **When all parameters are valid (Facebook)**:
  ```bash
  curl -i "http://localhost:3003/us/search-2/?fbclid=test_fb&p2=US-hs-Bv-camp1&p15=US-hs-Bv-sub1&fb=1"
  ```
  $\rightarrow$ Returns HTML page (200 OK) with age buttons wired to:
  `https://nav.rutorbit.com/t/NDkwNV82NDA1/?url_id=2&fbclid=test_fb&p2=US-hs-Bv-camp1&p11=1253687&p15=US-hs-Bv-sub1`

### 2. Direct Redirect (`GET /click` or `GET /r`)
- **Valid Request**: Redirects to primary tracking link (Rutorbit).
- **Invalid Request**: Redirects to Fallback (`openvista.live`).

### 3. JSON API (`GET /api/v1/tracking/resolve`)
Returns `{ status, destinationUrl, isFallback, targetPlatform, denyReason }`.

### 4. Health Check (`GET /health`)
Returns `{ status: "ok", uptime, timestamp }`.
