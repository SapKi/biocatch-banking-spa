# SecureBank – BioCatch Take-Home Assignment

A React + TypeScript SPA that simulates a banking user journey and integrates the BioCatch behavioral-biometrics SDK.

---

## Prerequisites

You need the following installed on your machine before you can run this project:

| Tool | Minimum version | How to install |
|------|----------------|----------------|
| **Node.js** | v18.0.0 | [nodejs.org/en/download](https://nodejs.org/en/download) |
| **npm** | v9.0.0 | Bundled with Node.js — no separate install needed |
| **Git** | any recent version | [git-scm.com/downloads](https://git-scm.com/downloads) |

### Verify your environment

Open a terminal and run:

```bash
node -v
# Expected: v18.x.x or higher (e.g. v20.11.0)

npm -v
# Expected: 9.x.x or higher (e.g. 10.2.4)

git --version
# Expected: git version 2.x.x or higher
```

If `node -v` prints a version below 18, install the latest LTS from [nodejs.org](https://nodejs.org).

---

## Setup & Run — Step by Step

### Step 1 — Clone the repository

```bash
git clone https://github.com/SapKi/biocatch-banking-spa.git
```

### Step 2 — Enter the project folder

```bash
cd biocatch-banking-spa
```

### Step 3 — Install dependencies

```bash
npm install
```

This will install React, React Router, Vite, TypeScript, and ESLint.
Expected output ends with: `added N packages in Xs`

### Step 4 — Start the development server

```bash
npm run dev
```

Expected output:

```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5 — Open in browser

Navigate to **[http://localhost:5173](http://localhost:5173)**

The app loads immediately. No login credentials are required — any non-empty username and password will work.

---

## All Available Commands

```bash
npm run dev      # start local development server on http://localhost:5173
npm run build    # compile TypeScript + bundle for production (output: /dist)
npm run preview  # serve the /dist folder locally to test the production build
npm run lint     # run ESLint across all .ts and .tsx files
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm install` fails with EACCES | Run as administrator, or fix npm permissions |
| Port 5173 already in use | Stop the other process, or run `npm run dev -- --port 3000` |
| `node: command not found` | Node.js is not installed or not on PATH — reinstall from nodejs.org |
| White screen, no console errors | Hard refresh with Ctrl+Shift+R (clears Vite cache) |
| SDK not loading (`cdApi not available`) | Check DevTools Network for the SDK script request — may be blocked by an ad blocker |

---

## User Flow

```
Home  ──►  Login  ──►  Account Overview  ──►  Make Payment  ──►  Logout
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                                     │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  index.html  (SDK bootstrap layer)                                     │  │
│  │                                                                        │  │
│  │  <meta name="isHybrid" content="false" />                             │  │
│  │  <script defer src="https://bcdn-4ff4f23f.we-stats.com/...js" />      │  │
│  └──────────────────────────────┬─────────────────────────────────────── ┘  │
│                                 │ registers on load                          │
│                                 ▼                                            │
│                          window.cdApi  ◄──────────────────────────────┐     │
│                                 │                                      │     │
│                                 │ wrapped by                           │     │
│  ┌──────────────────────────────▼───────────────────────────────────┐  │     │
│  │  sdkService.ts                                                    │  │     │
│  │  setCustomerSessionId(csid)  ──► cdApi.setCustomerSessionId()     ├──┘     │
│  │  changeContext(screen)       ──► cdApi.changeContext()            │       │
│  │  setCustomerBrand(brand)     ──► cdApi.setCustomerBrand()         │       │
│  └──────────────┬───────────────────────────────────────────────────┘       │
│                 │ called by                                                   │
│  ┌──────────────▼───────────────────────────────────────────────────────┐   │
│  │  React Application                                                    │   │
│  │                                                                       │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │  AuthContext  (single source of truth for session state)        │  │   │
│  │  │                                                                 │  │   │
│  │  │  user: User | null       ← set on login, cleared on logout      │  │   │
│  │  │  csid: string | null     ← UUID stored in sessionStorage        │  │   │
│  │  │  initDone: boolean       ← true only after init API succeeds    │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  │                │ consumed by all pages                                │   │
│  │                │                                                      │   │
│  │  ┌─────────────▼──────────────────────────────────────────────────┐  │   │
│  │  │  React Router  (BrowserRouter)                                  │  │   │
│  │  │                                                                  │  │   │
│  │  │  /          ──► Home.tsx                                         │  │   │
│  │  │  /login     ──► Login.tsx        ──► triggerInit(csid)           │  │   │
│  │  │  /account   ──► [ProtectedRoute] ──► Account.tsx                 │  │   │
│  │  │  /payment   ──► [ProtectedRoute] ──► Payment.tsx ──► triggerGetScore(csid)│  │
│  │  │                                                                  │  │   │
│  │  │  Every page calls: useSDKContext("screen_name")                  │  │   │
│  │  │                    └──► changeContext() on mount                 │  │   │
│  │  └──────────────────────────────────┬─────────────────────────────┘  │   │
│  │                                     │                                 │   │
│  │  ┌──────────────────────────────────▼─────────────────────────────┐  │   │
│  │  │  apiService.ts                                                  │  │   │
│  │  │  triggerInit(csid)      ──► POST { action: "init",     ... }    │  │   │
│  │  │  triggerGetScore(csid)  ──► POST { action: "getScore", ... }    │  │   │
│  │  └──────────────────────────────────┬─────────────────────────────┘  │   │
│  └─────────────────────────────────────┼───────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────┘
                                         │ fetch() POST
                    ┌────────────────────▼─────────────────────┐
                    │  External Services                         │
                    │                                            │
                    │  ┌─────────────────────────────────────┐  │
                    │  │  Zapier Webhook                      │  │
                    │  │  hooks.zapier.com/hooks/catch/...    │  │
                    │  │  Receives: init / getScore payloads  │  │
                    │  └─────────────────────────────────────┘  │
                    │                                            │
                    │  ┌─────────────────────────────────────┐  │
                    │  │  BioCatch Cloud                      │  │
                    │  │  Receives behavioral data from SDK   │  │
                    │  │  (mouse, keyboard, touch patterns)   │  │
                    │  └─────────────────────────────────────┘  │
                    └────────────────────────────────────────────┘
```

---

## Data Flow — Login & Payment

```
  User          Login.tsx       AuthContext      sdkService      apiService      Zapier
   │                │                │                │               │             │
   │  submit form   │                │                │               │             │
   │───────────────►│                │                │               │             │
   │                │  login(user)   │                │               │             │
   │                │───────────────►│                │               │             │
   │                │                │ generateUUID() │               │             │
   │                │                │ sessionStorage │               │             │
   │                │                │  .setItem(csid)│               │             │
   │                │                │ setCustomerSessionId(csid)     │             │
   │                │                │───────────────►│               │             │
   │                │                │                │ cdApi.setCSID()            │
   │                │  triggerInit(csid)               │               │             │
   │                │──────────────────────────────────────────────── ►│             │
   │                │                │                │  POST action:"init"         │
   │                │                │                │               │────────────►│
   │                │                │                │               │◄────────────│
   │                │  markInitDone()│                │               │  200 OK     │
   │                │───────────────►│                │               │             │
   │                │                │ initDone=true  │               │             │
   │◄───────────────│ navigate(/account)               │               │             │
   │                │                │                │               │             │
   │                │                │                │               │             │
   ╔════════════════╪════════════════╪════════════════╪═══════════════╪═════════════╪═══╗
   ║  Later: Payment screen          │                │               │             │   ║
   ╚════════════════╪════════════════╪════════════════╪═══════════════╪═════════════╪═══╝
   │                │                │                │               │             │
   │  submit form   │                │                │               │             │
   │───────────────►│                │                │               │             │
   │                │ check initDone │                │               │             │
   │                │───────────────►│ true ✓         │               │             │
   │                │ triggerGetScore(csid!)           │               │             │
   │                │──────────────────────────────────────────────── ►│             │
   │                │                │                │ POST action:"getScore"      │
   │                │                │                │               │────────────►│
   │                │                │                │               │◄────────────│
   │◄───────────────│ show success badge               │               │  200 OK     │
   │                │                │                │               │             │
```

---

## Folder Structure

```
biocatch-banking-spa/
├── index.html                  # SDK script tag + isHybrid metatag
├── tsconfig.json               # TypeScript config (strict mode)
├── src/
│   ├── main.tsx                # Entry: BrowserRouter + AuthProvider + App
│   ├── App.tsx                 # Route definitions + layout shell
│   ├── index.css               # Global CSS reset
│   ├── types.ts                # Shared interfaces: User, ApiStatus, ApiPayload...
│   ├── global.d.ts             # CdApi interface + Window.cdApi declaration
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Session state: user, csid, initDone
│   │
│   ├── services/
│   │   ├── sdkService.ts       # Wrapper around window.cdApi
│   │   └── apiService.ts       # triggerInit() and triggerGetScore()
│   │
│   ├── hooks/
│   │   └── useSDKContext.ts    # Calls changeContext() on every page mount
│   │
│   ├── utils/
│   │   └── uuid.ts             # crypto.randomUUID() with Math.random fallback
│   │
│   ├── components/
│   │   ├── Navbar.tsx          # Top navigation bar with logout
│   │   ├── ProtectedRoute.tsx  # Redirects to /login if not authenticated
│   │   └── StatusBadge.tsx     # idle / loading / success / error feedback
│   │
│   └── pages/
│       ├── Home.tsx            # Public landing page
│       ├── Login.tsx           # Login form — triggers init API
│       ├── Account.tsx         # Account overview (protected)
│       └── Payment.tsx         # Payment form — triggers getScore API
```

---

## Architecture Decisions

### 1. SDK loaded in `index.html` — not lazily in React

```html
<script src="https://bcdn-4ff4f23f.we-stats.com/scripts/4ff4f23f/4ff4f23f.js" defer></script>
```

Loading in `<head defer>` guarantees `window.cdApi` exists before the React bundle executes. Lazy-loading inside a component creates a race condition where the first `changeContext` fires before `cdApi` is ready. The `<meta name="isHybrid" content="false">` tag is also required — the SDK reads it on load to choose its web vs. native branch.

### 2. CSID stored in `sessionStorage`

`sessionStorage` is cleared when the tab closes — correct for a banking session. A new tab = a new session = a new CSID. `localStorage` would persist the same CSID across tabs and browser restarts, which is wrong for fraud detection.

### 3. `initDone` gates getScore

`AuthContext` holds `initDone: boolean` that starts `false` and is set to `true` only after `triggerInit()` resolves. The Payment page reads it and blocks submission — enforced at the data layer, not just in the UI.

### 4. SDK context changes are per-page hooks

Each page calls `useSDKContext("screen_name")`. The hook fires `changeContext` once on mount via `useEffect(fn, [])`. No central route-watcher — each page owns its own SDK context declaration.

### 5. API layer is separated from UI

Pages call named functions (`triggerInit`, `triggerGetScore`). The endpoint URL, headers, payload shape, and logs all live in `apiService.ts`. The `Action` and `ActivityType` union types prevent invalid values at compile time.

### 6. TypeScript strict mode

Shared contracts in `src/types.ts`. `window.cdApi` typed via `global.d.ts` Window augmentation — no `any` casts. `strict: true` enforces null checks, no implicit any, no unused variables.

### 7. Context API instead of Redux

Three values, one linear flow. Redux adds boilerplate with no benefit here.

---

## API Reference

Both calls POST to: `https://hooks.zapier.com/hooks/catch/1888053/bgwofce/`

| User action  | Function          | `action`     | `activityType` |
|--------------|-------------------|--------------|----------------|
| Click Login  | `triggerInit`     | `"init"`     | `"LOGIN"`      |
| Click Pay    | `triggerGetScore` | `"getScore"` | `"PAYMENT"`    |

Example payload:
```json
{
  "customerId": "dummy",
  "action": "init",
  "customerSessionId": "550e8400-e29b-41d4-a716-446655440000",
  "activityType": "LOGIN",
  "uuid": "a3f1c2d4-...",
  "brand": "SD",
  "solution": "ATO",
  "iam": "sapirkikoz@gmail.com"
}
```

---

## SDK Calls per Screen

| Event          | SDK call                                |
|----------------|-----------------------------------------|
| Page: Home     | `cdApi.changeContext("home_screen")`    |
| Page: Login    | `cdApi.changeContext("login_screen")`   |
| User logs in   | `cdApi.setCustomerSessionId(csid)`      |
| Page: Account  | `cdApi.changeContext("account_screen")` |
| Page: Payment  | `cdApi.changeContext("payment_screen")` |

---

## Observability — Browser Console

Open **DevTools → Console**:

```
[App]  Booting SecureBank SPA
[SDK]  changeContext → home_screen
[SDK]  changeContext → login_screen
[Auth] New CSID generated → <uuid>
[SDK]  setCustomerSessionId → <uuid>
[API]  Request → init  { customerId, action, customerSessionId, ... }
[API]  Response ← init { status: "success" }
[SDK]  changeContext → account_screen
[SDK]  changeContext → payment_screen
[API]  Request → getScore { ... }
[API]  Response ← getScore { ... }
[Auth] Session ended — CSID cleared
```

Open **DevTools → Network**, filter by `bgwofce` to inspect the full request/response payload.

---

## Screenshots to Capture

1. **Home page** — hero with "Get Started" button
2. **Login page** — form with credentials filled
3. **Login loading** — "Signing in…" status badge
4. **Account page** — account cards + transaction table
5. **Payment page** — form filled
6. **Payment success** — green status badge
7. **DevTools Console** — all `[SDK]` and `[API]` log lines visible
8. **DevTools Network** — POST to Zapier with full JSON payload

---

## Demo Video Flow (~3 minutes)

1. Open app → Home → console shows `changeContext → home_screen`
2. Click "Get Started" → Login → `changeContext → login_screen`
3. Enter credentials → Sign In → CSID generated, `init` fires, success badge
4. Redirect to Account → account cards + transactions + console log
5. Click "Make a Payment" → fill form → Confirm → `getScore` fires + success
6. Logout → login again → **new CSID** in console (shows fresh session)
7. DevTools Network → show full `init` payload in request body

---

## Git Commit Structure

```
chore: scaffold Vite + React project
feat: add AuthContext with CSID lifecycle management
feat: integrate BioCatch SDK globally and add sdkService wrapper
feat: add apiService with triggerInit and triggerGetScore
feat: add useSDKContext hook for per-page context tracking
feat: implement all pages — Home, Login, Account, Payment
feat: add Navbar, ProtectedRoute, and StatusBadge components
docs: add README with architecture decisions and setup guide
refactor: migrate full codebase to TypeScript
```

---

## Notes

- No real authentication — any non-empty username/password logs in.
- Account balances and transactions are static mock data.
- The Zapier webhook accepts any valid JSON; a real integration would parse the score from the response and act on it.
