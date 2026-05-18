# SecureBank – BioCatch Take-Home Assignment

A React + TypeScript SPA that simulates a banking user journey and integrates the BioCatch behavioral-biometrics SDK.

**Stack:** React 19 · TypeScript (strict) · React Router 7 · Vite 8 · CSS Modules · localStorage DB

---

## Prerequisites

> **Why Node.js?**
> This project is a pure browser SPA — the final output (`/dist`) is static HTML/CSS/JS with zero server requirement.
> Node.js is needed **only during development** to run the build toolchain: Vite (dev server + bundler), npm (package manager), and the TypeScript compiler.
> Once built, the output can be served by any static host (Nginx, Netlify, GitHub Pages) without Node.js.

| Tool | Minimum version | Purpose | How to install |
|------|----------------|---------|----------------|
| **Node.js** | v18.0.0 | Runs Vite dev server and TypeScript compiler | [nodejs.org/en/download](https://nodejs.org/en/download) |
| **npm** | v9.0.0 | Downloads and manages packages | Bundled with Node.js |
| **Git** | any recent | Clones the repository | [git-scm.com/downloads](https://git-scm.com/downloads) |

```bash
node -v   # expected: v18.x.x or higher
npm -v    # expected: 9.x.x or higher
```

---

## Setup & Run

```bash
# 1. Clone
git clone https://github.com/SapKi/biocatch-banking-spa.git
cd biocatch-banking-spa

# 2. Install
npm install

# 3. Start
npm run dev
# → http://localhost:5173
```

### All commands

```bash
npm run dev      # development server on http://localhost:5173
npm run build    # TypeScript check + production bundle → /dist
npm run preview  # serve /dist locally
npm run lint     # ESLint across all .ts and .tsx files
```

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 5173 in use | `npm run dev -- --port 3000` |
| White screen | Hard-refresh Ctrl+Shift+R |
| SDK not loading | Disable ad blocker for localhost — Zapier and BioCatch CDN may be blocked |
| `Failed to fetch` on login/signup | Same as above — open Chrome Incognito to test |

---

## User Flow

```
Sign Up  ──►  Account Overview  ──►  Make Payment  ──►  Logout
                    ▲
Login    ───────────┘
```

---

## Architecture Tree

### 1 — Folder & Dependency Map

Every file is listed with the `src/` modules it directly imports.

```
src/
│
├── config.ts              ← no src/ imports  (root constants — everything reads this)
├── types.ts               ← no src/ imports  (shared TypeScript contracts)
├── global.d.ts            ← no src/ imports  (Window.cdApi type augmentation)
│
├── utils/
│   ├── uuid.ts            ← no src/ imports
│   └── transactionStore.ts  → config · types
│
├── db/
│   └── userStore.ts       → config
│
├── services/
│   ├── httpClient.ts      ← no src/ imports  (raw fetch — knows nothing about BioCatch)
│   ├── apiService.ts      → httpClient · config · types · utils/uuid
│   └── sdkService.ts      ← no src/ imports  (thin wrapper over window.cdApi)
│
├── hooks/
│   └── useSDKContext.ts   → services/sdkService
│
├── context/
│   └── AuthContext.tsx    → services/sdkService · utils/uuid · types
│
├── components/
│   ├── Navbar.tsx         → context/AuthContext
│   ├── ProtectedRoute.tsx → context/AuthContext
│   └── StatusBadge.tsx    → types
│
└── pages/
    ├── Home.tsx           → context/AuthContext · hooks/useSDKContext
    ├── Login.tsx          → context/AuthContext · hooks/useSDKContext
    │                         services/apiService · db/userStore
    │                         components/StatusBadge · types
    ├── SignUp.tsx         → context/AuthContext · hooks/useSDKContext
    │                         services/apiService · db/userStore
    │                         components/StatusBadge · types
    ├── Account.tsx        → context/AuthContext · hooks/useSDKContext
    │                         utils/transactionStore · db/userStore
    └── Payment.tsx        → context/AuthContext · hooks/useSDKContext
                              services/apiService · utils/transactionStore
                              db/userStore · components/StatusBadge · types
```

---

### 2 — Layer Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│  PAGES & COMPONENTS                                                     │
│  Home · Login · SignUp · Account · Payment · Navbar · StatusBadge      │
│                                                                         │
│  Pages call named functions only.                                       │
│  They never touch fetch, cdApi, or localStorage directly.              │
└────────┬──────────────┬──────────────┬─────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌────────────────┐ ┌──────────────┐ ┌───────────────────────────────────┐
│  apiService.ts │ │ sdkService.ts│ │  db/userStore.ts                  │
│                │ │              │ │  utils/transactionStore.ts        │
│  Builds the    │ │  Wraps       │ │                                   │
│  BioCatch JSON │ │  window.cdApi│ │  Reads/writes localStorage.       │
│  payload.      │ │  with guards │ │  Owns all persistence logic.      │
│  Calls         │ │  and logs.   │ │                                   │
│  httpClient.   │ └──────┬───────┘ └───────────────────────────────────┘
└────────┬───────┘        │
         │                ▼
         ▼         window.cdApi
┌────────────────┐  (BioCatch SDK — loaded globally in index.html)
│  httpClient.ts │
│                │
│  Generic POST. │
│  Handles CORS, │
│  errors, logs. │
│  No BioCatch   │
│  knowledge.    │
└────────┬───────┘
         │
         ▼
┌────────────────────────────────────┐
│  Zapier Webhook                    │
│  hooks.zapier.com/hooks/catch/...  │
└────────────────────────────────────┘
```

---

### 3 — Data Flow: Login

```
 User       Login.tsx      AuthContext     userStore    sdkService    apiService   httpClient   Zapier
  │              │               │              │             │             │            │          │
  │ submit       │               │              │             │             │            │          │
  │─────────────►│               │              │             │             │            │          │
  │              │ loginUser()   │              │             │             │            │          │
  │              │──────────────────────────────►│             │             │            │          │
  │              │              { ok: true }    │             │             │            │          │
  │              │◄──────────────────────────────│             │             │            │          │
  │              │ startSession()│              │             │             │            │          │
  │              │──────────────►│              │             │             │            │          │
  │              │               │ generateUUID │             │             │            │          │
  │              │               │ sessionStorage.setItem(csid)             │            │          │
  │              │               │ setCustomerSessionId(csid) │             │            │          │
  │              │               │──────────────────────────►│             │            │          │
  │              │ triggerInit(csid, email)      │             │             │            │          │
  │              │─────────────────────────────────────────────────────────►│            │          │
  │              │               │              │             │ buildPayload│            │          │
  │              │               │              │             │─────────────────────────►│          │
  │              │               │              │             │             │  fetch POST│          │
  │              │               │              │             │             │────────────────────── ►│
  │              │               │              │             │             │◄──────────────────────│
  │              │               │              │             │             │  200 OK    │          │
  │              │ completeAuth()│              │             │             │            │          │
  │              │──────────────►│              │             │             │            │          │
  │              │               │ user=email   │             │             │            │          │
  │              │               │ initDone=true│             │             │            │          │
  │◄─────────────│ navigate(/account)           │             │             │            │          │
```

---

### 4 — Data Flow: Payment

```
 User       Payment.tsx    AuthContext    userStore   transactionStore  apiService  httpClient  Zapier
  │              │               │             │              │              │           │         │
  │ submit form  │               │             │              │              │           │         │
  │─────────────►│               │             │              │              │           │         │
  │              │ read initDone │             │              │              │           │         │
  │              │──────────────►│ true ✓      │              │              │           │         │
  │              │ triggerGetScore(csid, email)│              │              │           │         │
  │              │────────────────────────────────────────────────────────── ►│           │         │
  │              │               │             │              │  buildPayload│           │         │
  │              │               │             │              │──────────────────────── ►│         │
  │              │               │             │              │              │ fetch POST│         │
  │              │               │             │              │              │────────────────────►│
  │              │               │             │              │              │◄────────────────────│
  │              │               │             │              │              │  200 OK   │         │
  │              │ deductFromChecking(email, amount)          │              │           │         │
  │              │──────────────────────────── ►│              │              │           │         │
  │              │ addTransaction(email, tx)   │              │              │           │         │
  │              │─────────────────────────────────────────── ►│              │           │         │
  │◄─────────────│ show success badge          │              │              │           │         │
```

---

## Folder Structure (complete)

```
biocatch-banking-spa/
├── index.html                        # SDK <script defer> + <meta isHybrid=false>
├── tsconfig.json                     # strict mode, bundler resolution, noEmit
├── vite.config.js
├── package.json
│
└── src/
    ├── main.tsx                      # React root — BrowserRouter + AuthProvider
    ├── App.tsx                       # Route table
    ├── index.css                     # Global reset (box-sizing, font, body)
    ├── config.ts                     # All constants — endpoint, DB keys, balances
    ├── types.ts                      # User · ApiStatus · Transaction · ApiPayload · ...
    ├── global.d.ts                   # CdApi interface · Window augmentation
    │
    ├── context/
    │   └── AuthContext.tsx           # user · csid · initDone · startSession · completeAuth · logout
    │
    ├── db/
    │   └── userStore.ts              # registerUser · loginUser · getBalances · deductFromChecking
    │
    ├── services/
    │   ├── httpClient.ts             # post(url, body) — generic, zero BioCatch knowledge
    │   ├── apiService.ts             # triggerInit · triggerGetScore · triggerRegister
    │   └── sdkService.ts             # setCustomerSessionId · changeContext · setCustomerBrand
    │
    ├── hooks/
    │   └── useSDKContext.ts          # useEffect → changeContext on mount
    │
    ├── utils/
    │   ├── uuid.ts                   # generateUUID() — crypto.randomUUID + fallback
    │   ├── logger.ts                 # Coloured console logger — one domain per colour
    │   └── transactionStore.ts       # getTransactions · addTransaction · clearTransactions
    │
    ├── components/
    │   ├── Navbar.tsx                # nav bar, login/logout state, email display
    │   ├── Navbar.module.css
    │   ├── ProtectedRoute.tsx        # redirects to /login if user is null
    │   ├── StatusBadge.tsx           # idle / loading / success / error UI
    │   └── StatusBadge.module.css
    │
    └── pages/
        ├── Home.tsx                  # landing page, CTA → /login or /account
        ├── Home.module.css
        ├── Login.tsx                 # validates DB → startSession → triggerInit → completeAuth
        ├── Login.module.css
        ├── SignUp.tsx                # registers DB → startSession → triggerRegister → completeAuth
        ├── SignUp.module.css
        ├── Account.tsx               # reads balances + transactions from DB
        ├── Account.module.css
        ├── Payment.tsx               # triggerGetScore → deductFromChecking → addTransaction
        └── Payment.module.css
```

---

## Configuration — `src/config.ts`

Zero magic numbers anywhere else in the codebase.

```typescript
API_ENDPOINT             // 'https://hooks.zapier.com/hooks/catch/1888053/bgwofce/'
API_BRAND                // 'SD'
API_SOLUTION             // 'ATO'
API_CUSTOMER_ID          // 'dummy'
DB_USERS_KEY             // 'bc_users'
DB_TRANSACTIONS_PREFIX   // 'bc_transactions_'
INITIAL_CHECKING_BALANCE // 5000.00
INITIAL_SAVINGS_BALANCE  // 12500.00
```

---

## Database & Storage

| Where | What | Key | Lifetime |
|-------|------|-----|----------|
| `localStorage` | Registered users | `bc_users` | Until manually cleared |
| `localStorage` | Transactions per user | `bc_transactions_{email}` | Until manually cleared |
| `sessionStorage` | Active CSID | `csid` | Until tab closes or logout |
| React state | `user`, `initDone` | — | Until page refresh or logout |

**To clear all data:**
```
DevTools → Application → Local Storage → right-click → Clear All
DevTools → Application → Session Storage → right-click → Clear All
```
Or in console: `localStorage.clear(); sessionStorage.clear();`

---

## Auth Flow — Two Steps

```
startSession()    ──►  generateUUID as CSID
                       sessionStorage.setItem('csid', csid)
                       sdkService.setCustomerSessionId(csid)
                       ← user is still null here

API call succeeds ──►  completeAuth({ email, isNewUser })
                       user = email
                       initDone = true
                       ← only now is the user considered authenticated
```

If the API call fails, `user` stays `null`. The Navbar shows no links. ProtectedRoute blocks `/account` and `/payment`. No half-authenticated state is possible.

---

## SDK Integration

### Loading

```html
<!-- index.html -->
<meta name="isHybrid" content="false" />
<script defer src="https://bcdn-4ff4f23f.we-stats.com/scripts/4ff4f23f/4ff4f23f.js"></script>
```

`defer` ensures `window.cdApi` exists before the React bundle runs.  
`isHybrid=false` activates the web (non-native) SDK branch.

### SDK calls per screen

| Trigger | Call |
|---------|------|
| Home mounts | `cdApi.changeContext("home_screen")` |
| Login mounts | `cdApi.changeContext("login_screen")` |
| SignUp mounts | `cdApi.changeContext("signup_screen")` |
| User logs in / signs up | `cdApi.setCustomerSessionId(csid)` |
| Account mounts | `cdApi.changeContext("account_screen")` |
| Payment mounts | `cdApi.changeContext("payment_screen")` |

---

## How the Two Parts Connect

The BioCatch system has two independent channels that run in parallel during a session. The CSID is the single thread that ties them together.

```
┌─────────────────────────────────────────────────────────────────┐
│  Channel 1 — SDK (automatic, background)                        │
│                                                                 │
│  SDK loads → user interacts → SDK collects keystrokes,          │
│  mouse movement, device signals → periodically POSTs data       │
│  packets to wup-4ff4f23f.eu.v2.we-stats.com                    │
│                                                                 │
│  Every packet is tagged with:  customerSessionId = <CSID>       │
└────────────────────────────┬────────────────────────────────────┘
                             │ same CSID
┌────────────────────────────▼────────────────────────────────────┐
│  Channel 2 — API (explicit, event-driven)                       │
│                                                                 │
│  Login / SignUp  →  triggerInit   (action: "init")              │
│  Payment         →  triggerGetScore (action: "getScore")        │
│                                                                 │
│  Every payload includes:   customerSessionId = <CSID>           │
└─────────────────────────────────────────────────────────────────┘
```

**On the BioCatch backend:** when a `getScore` call arrives, the server looks up all SDK data packets that were sent under the same CSID during that session, combines the behavioral signal with the action context, and returns a risk score.

### CSID lifecycle in this app

| Step | Code | What happens |
|------|------|-------------|
| User logs in / signs up | `AuthContext.tsx` → `generateUUID()` | A fresh UUID is created as the CSID |
| SDK is informed | `sdkService.setCustomerSessionId(csid)` | All future SDK packets carry this CSID |
| API calls carry it | `apiService.ts` → `customerSessionId: csid` | Backend can match SDK data to this call |
| Stored for the tab | `sessionStorage.setItem('csid', csid)` | Survives page refresh, cleared on tab close |
| Cleared on logout | `sessionStorage.removeItem('csid')` | Next login generates a new CSID — clean session |

### Background data collection and CORS in development

Once loaded, the SDK silently collects behavioral data and periodically ships it to `wup-4ff4f23f.eu.v2.we-stats.com`. In a local dev environment (`localhost:5173`) this upload is blocked by CORS because BioCatch's collection server only whitelists registered production domains.

This surfaces as a console error:
```
Access to XMLHttpRequest at 'https://wup-4ff4f23f.eu.v2.we-stats.com/...'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

This is expected and harmless in development:
- `changeContext` and `setCustomerSessionId` still execute correctly
- The Zapier API calls (`triggerInit`, `triggerGetScore`) are unaffected
- In a production deployment the client domain is registered with BioCatch, the CORS error disappears, and data collection works end-to-end

---

## API Reference

**Endpoint:** `POST https://hooks.zapier.com/hooks/catch/1888053/bgwofce/`

| User action | Function | `action` | `activityType` |
|-------------|----------|----------|----------------|
| Login | `triggerInit` | `"init"` | `"LOGIN"` |
| Sign Up | `triggerRegister` | `"init"` | `"REGISTRATION"` |
| Payment | `triggerGetScore` | `"getScore"` | `"PAYMENT"` |

**Payload shape:**

```json
{
  "customerId": "dummy",
  "action": "init",
  "customerSessionId": "<uuid>",
  "activityType": "LOGIN",
  "uuid": "<random-uuid-per-call>",
  "brand": "SD",
  "solution": "ATO",
  "iam": "user@email.com"
}
```

**Sequencing rule:** `getScore` is blocked until `initDone === true`.  
`initDone` is set only after `triggerInit` / `triggerRegister` returns HTTP 200.

---

## Error Handling

All network calls go through `httpClient.ts`, which is the single point of failure handling for the HTTP layer. UI pages catch errors from the API layer and display them via `StatusBadge`.

### Layer map

| Layer | File | What is caught | What happens |
|-------|------|---------------|--------------|
| **Network** | `httpClient.ts` | `fetch` throws (offline, timeout, CORS) | Logged, re-thrown with descriptive message |
| **HTTP** | `httpClient.ts` | `response.ok === false` (4xx, 5xx) | Response body read, thrown as `Error("HTTP 4xx: ...")` |
| **API — Login** | `Login.tsx` | `triggerInit` rejects | `setApiStatus({ status: 'error', message })` → red `StatusBadge` |
| **API — SignUp** | `SignUp.tsx` | `triggerRegister` rejects | Same pattern |
| **API — Payment** | `Payment.tsx` | `triggerGetScore` rejects | Same pattern |
| **DB validation** | `userStore.ts` | Wrong password / email not found | Returns `{ ok: false, error }` — no exception thrown |
| **DB corruption** | `userStore.ts`, `transactionStore.ts` | `JSON.parse` throws on corrupt data | Returns `[]` / empty state, app continues |
| **SDK unavailable** | `sdkService.ts` | `window.cdApi` not ready | Logs a warning, returns silently — page still loads |

### Request origin

All requests are made **client-side** (browser → external endpoint). There is no backend server in this project.

```
Browser → Zapier webhook   (BioCatch scoring API — mocked)
Browser → BioCatch CDN     (SDK script, loaded via <script defer>)
Browser → BioCatch WUP     (SDK behavioral data upload — blocked by CORS in dev)
```

This is intentional for the take-home scope. In a production integration the `triggerInit` / `triggerGetScore` calls would originate from a backend server to keep the endpoint and credentials out of the browser.

---

## Observability — Coloured Console Logger

All log output goes through `src/utils/logger.ts`. Each domain has its own colour so you can visually separate concerns at a glance in DevTools.

### Colour Map

| Colour | Tag | Domain | File |
|--------|-----|--------|------|
|  Slate | `[App]` | Boot messages | `main.tsx` |
| 🔵 Blue | `[Auth]` | CSID lifecycle, session state | `AuthContext.tsx` |
| 🟢 Green | `[App→SDK]` | App calls into the BioCatch SDK | `sdkService.ts` |
| 🟡 Amber | `[API]` | Payload builder | `apiService.ts` |
| 🔵 Cyan | `[HTTP]` | Raw fetch — request, status, response | `httpClient.ts` |
| 🟣 Violet | `[DB]` | localStorage — users and transactions | `userStore.ts`, `transactionStore.ts` |
| 🟠 Orange | `[Payment]` | Payment result | `Payment.tsx` |

> **React StrictMode and SDK calls**
>
> The app runs inside `<React.StrictMode>`, which in development intentionally double-invokes `useEffect` (mount → cleanup → remount) to surface accidental side effects. `useSDKContext` guards against this with a `useRef` flag: the first invocation sets the flag and calls `changeContext`; the second invocation sees the flag and exits early. Each `[App→SDK]` line therefore appears exactly once, in both development and production.

### Usage in code

```typescript
import { log } from '../utils/logger';

log.auth.info('New CSID generated →', csid);
log.sdk.info('changeContext →', screen);   // prints [App→SDK]
log.http.group('POST https://...');   // collapsible group
log.http.end();                        // closes group
log.db.error('Write failed', err);
```

### Full log sequence — Sign In to Payment

Open **DevTools → Console** and follow this sequence:

```
[App]      Booting SecureBank SPA
[App→SDK]  changeContext → home_screen
[App→SDK]  changeContext → login_screen
[DB]       User authenticated → user@example.com
[Auth]     New CSID generated → <uuid>
[App→SDK]  setCustomerSessionId → <uuid>
[API]      init / LOGIN — CSID: <uuid>
▼ [HTTP]   POST https://hooks.zapier.com/hooks/catch/...
    Body:     { customerId, action, customerSessionId, ... }
    Status:   200 OK
    Response: { attempt: "...", id: "...", status: "success" }
[Auth]     Session confirmed for user@example.com
[App→SDK]  changeContext → account_screen
[App→SDK]  changeContext → payment_screen
[API]      getScore / PAYMENT — CSID: <uuid>
▼ [HTTP]   POST https://hooks.zapier.com/hooks/catch/...
    Body:     { customerId, action: "getScore", ... }
    Status:   200 OK
    Response: { attempt: "...", status: "success" }
[DB]       Balance updated → checking: 4850.00
[DB]       Transaction saved → { date: "...", description: "Transfer to ...", amount: -150 }
[Payment]  getScore result: { ... }
[Auth]     Session ended — CSID cleared
```

Open **DevTools → Network**, filter by `bgwofce` to inspect the raw request/response payload.

---

## Architecture Decisions

### 1 — SDK in `<head defer>` not lazy-loaded in React
Race condition: if the SDK loads inside a component, the first `changeContext` fires before `cdApi` exists. `defer` guarantees the SDK is ready before the React bundle executes.

### 2 — CSID in `sessionStorage`, not `localStorage`
`sessionStorage` is scoped to one tab and cleared when the tab closes. Banking session = browser tab. `localStorage` would let the same CSID persist across tabs and restarts, mixing behavioral data across logically separate sessions.

### 3 — Two-step auth: `startSession` then `completeAuth`
`startSession` prepares the CSID and notifies the SDK. It does NOT set the user. `completeAuth` sets user + initDone atomically, only after the API succeeds. This prevents any half-authenticated state.

### 4 — `initDone` gates `getScore`
`initDone` starts `false` and is only set to `true` after `triggerInit` resolves. The Payment page checks it and blocks submission if it is `false`. Enforced at the data layer, not just the UI.

### 5 — `httpClient` separated from `apiService`
`httpClient` owns only raw fetch mechanics: sending the request, reading the response, normalising errors, and logging. `apiService` owns only the BioCatch payload shape. Neither knows about the other's concerns.

### 6 — All constants in `config.ts`
No magic strings or numbers scattered across files. One change to `config.ts` updates the entire app.

### 7 — CSS Modules — one file per component
Styles are co-located with their component and locally scoped. No class name collisions. Only truly dynamic values (opacity, cursor, amount color) remain as inline styles.

### 8 — `localStorage` DB — no backend
Users and transactions persist across sessions without any server. `bc_users` stores email, hashed password, and balances. `bc_transactions_{email}` stores that user's transaction history. Logout does not wipe the DB — data persists for the next login.

### 9 — Context API, not Redux
Three values (`user`, `csid`, `initDone`), one linear flow. Redux adds boilerplate with no architectural benefit here.

### 10 — Dead CSID on API failure is a known, accepted edge case
If `triggerInit` fails after `startSession` has already run, the CSID is written to `sessionStorage` and sent to the SDK — but `completeAuth` is never called, so `user` stays `null` and `initDone` stays `false`. The user sees an error and stays on the login page. The "dead" CSID remains in `sessionStorage` until the next successful login overwrites it or the tab closes.

This is acceptable because: the SDK has already tagged that CSID as the session; overwriting it on retry with a new CSID would split the behavioral data across two IDs. Keeping the same CSID means if the user retries and succeeds, the SDK data is contiguous under one session. In production, logout explicitly calls `sessionStorage.removeItem('csid')` to ensure a clean state.

---

## Demo Video Flow (~3 minutes)

1. Open app → Home → DevTools Console: `changeContext → home_screen`
2. Click "Sign Up" → fill email + password → Create Account → CSID generated, `init` fires
3. Redirect to Account → $5,000 checking, $12,500 savings, empty transaction list
4. Click "Make a Payment" → fill form → Confirm → `getScore` fires + balance deducted
5. Click "View Transactions" → payment appears at top of list
6. Logout → login again with same credentials → balance and transactions restored from DB
7. DevTools Network → show `init` payload → show `getScore` payload

---

## Screenshots to Capture

1. **Sign Up page** — form
2. **Account page** — account cards showing initial balances
3. **Payment page** — form filled
4. **Account page after payment** — updated balance + transaction in list
5. **DevTools Console** — full log sequence from login to payment
6. **DevTools Network** — POST to Zapier with full JSON payload visible
7. **DevTools Application → Local Storage** — `bc_users` and `bc_transactions_*` keys
