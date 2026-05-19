# SecureBank – BioCatch Take-Home Assignment

A React + TypeScript SPA that simulates a banking user journey and integrates the BioCatch behavioral-biometrics SDK.

**Stack:** React 19 · TypeScript (strict) · React Router 7 · Vite 8 · CSS Modules · localStorage DB

---

## How to Run — Step by Step

> No prior experience needed. Follow each step in order.

---

### Step 1 — Install Node.js

Node.js is the engine that runs the development tools. The app itself runs in the browser — Node.js is only needed to start the local server.

1. Go to **[nodejs.org/en/download](https://nodejs.org/en/download)**
2. Download the **LTS** version (the button labelled "LTS" — not "Current")
3. Run the installer and click through with all default options
4. When it finishes, open a terminal:
   - **Windows:** press `Win + R`, type `cmd`, press Enter
   - **Mac:** press `Cmd + Space`, type `Terminal`, press Enter
5. Type this and press Enter to confirm it worked:
   ```
   node -v
   ```
   You should see something like `v20.x.x`. If you do, Node.js is installed.

---

### Step 2 — Download the project

You have two options:

**Option A — Download as a ZIP (no Git needed)**
1. Go to the GitHub page: **https://github.com/SapKi/biocatch-banking-spa**
2. Click the green **Code** button → **Download ZIP**
3. Unzip the downloaded file somewhere on your computer (e.g. your Desktop)

**Option B — Clone with Git**
```
git clone https://github.com/SapKi/biocatch-banking-spa.git
```

---

### Step 3 — Open the project folder in the terminal

In your terminal, navigate into the project folder.

```
cd Desktop/biocatch-banking-spa
```

> **Tip:** If you're not sure where you unzipped it, drag the folder into the terminal window — it will paste the full path for you.

Confirm you're in the right place by running:
```
ls
```
You should see files like `package.json`, `index.html`, `src/`, etc.

---

### Step 4 — Install dependencies

The project uses open-source libraries listed in `package.json`. This command downloads all of them:

```
npm install
```

This takes 30–60 seconds. You'll see a progress bar. When it's done the cursor will return. You only need to do this **once**.

---

### Step 5 — Create the environment file

The app needs one configuration file that is not included in the repository (it contains a live URL).

1. In the project folder, create a file called **`.env`**
2. Open it with any text editor (Notepad is fine)
3. Paste this single line inside and save:

```
VITE_API_ENDPOINT=https://hooks.zapier.com/hooks/catch/1888053/bgwofce/
```

---

### Step 6 — Start the app

```
npm run dev
```

You will see output like:

```
  VITE v8.x.x  ready in 200ms

  ➜  Local:   http://localhost:5173/
```

---

### Step 7 — Open the app in your browser

Open **Chrome** (recommended — DevTools work best here) and go to:

```
http://localhost:5173
```

The SecureBank app will load. To stop the server at any time, go back to the terminal and press `Ctrl + C`.

---

### Every time after that

Steps 1–5 are one-time setup. Next time you want to run the project:

1. Open your terminal
2. Navigate to the project folder: `cd Desktop/biocatch-banking-spa`
3. Run: `npm run dev`
4. Open `http://localhost:5173` in Chrome

---

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
│   ├── error.ts           ← no src/ imports  (getErrorMessage helper)
│   ├── format.ts          ← no src/ imports  (formatCurrency helper)
│   ├── storage.ts         ← no src/ imports  (readStorage generic helper)
│   └── logger.ts          ← no src/ imports
│
├── db/
│   ├── userStore.ts       → config · utils/storage
│   └── transactionStore.ts  → config · types · utils/storage · utils/uuid
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
    ├── Home.tsx           → context/AuthContext  (public — no SDK context call)
    ├── Login.tsx          → context/AuthContext · hooks/useSDKContext
    │                         services/apiService · db/userStore
    │                         utils/error · components/StatusBadge · types
    ├── SignUp.tsx         → context/AuthContext · hooks/useSDKContext
    │                         services/apiService · db/userStore
    │                         utils/error · components/StatusBadge · types
    ├── Account.tsx        → context/AuthContext · hooks/useSDKContext
    │                         db/transactionStore · db/userStore · utils/format
    └── Payment.tsx        → context/AuthContext · hooks/useSDKContext
                              services/apiService · db/transactionStore
                              db/userStore · utils/error · utils/format
                              components/StatusBadge · types
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
│                │ │              │ │  db/transactionStore.ts           │
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
    │   ├── error.ts                  # getErrorMessage(err) — normalises unknown catch values
    │   ├── format.ts                 # formatCurrency(amount) — Intl.NumberFormat wrapper
    │   └── storage.ts                # readStorage<T>(key, fallback) — safe JSON parse
    │
    ├── db/
    │   ├── userStore.ts              # registerUser · loginUser · getBalances · deductFromChecking · removeUser
    │   └── transactionStore.ts       # getTransactions (auto-migrates) · addTransaction · clearTransactions
    │
    ├── styles/
    │   └── form.module.css           # shared form layout — imported directly by Login & SignUp
    │
    ├── components/
    │   ├── Navbar.tsx                # nav bar, login/logout state, email display
    │   ├── Navbar.module.css
    │   ├── ProtectedRoute.tsx        # redirects to /login if user is null
    │   ├── StatusBadge.tsx           # idle / loading / success / error UI
    │   └── StatusBadge.module.css
    │
    └── pages/
        ├── Home.tsx                  # landing page, CTA → /login or /account (no SDK call)
        ├── Home.module.css
        ├── Login.tsx                 # validates DB → startSession → triggerInit → completeAuth
        ├── SignUp.tsx                # registers DB → startSession → triggerRegister → completeAuth
        ├── Account.tsx               # reads balances + transactions from DB
        ├── Account.module.css
        ├── Payment.tsx               # balance check → triggerGetScore → deductFromChecking → addTransaction
        └── Payment.module.css        # payment-specific additions only (base styles from styles/form.module.css)
```

---

## Configuration — `src/config.ts`

Zero magic numbers anywhere else in the codebase.

```typescript
API_ENDPOINT             // from VITE_API_ENDPOINT in .env
API_BRAND                // 'SD'
API_SOLUTION             // 'ATO'
API_CUSTOMER_ID          // 'dummy'
DB_USERS_KEY             // 'bc_users'
DB_TRANSACTIONS_PREFIX   // 'bc_transactions_'
INITIAL_CHECKING_BALANCE // 24750.00
ROUTES                   // { HOME, LOGIN, SIGNUP, ACCOUNT, PAYMENT }
SCREENS                  // { LOGIN, SIGNUP, ACCOUNT, PAYMENT }
REDIRECT_DELAY_MS        // 800
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
| Login mounts | `cdApi.changeContext("login_screen")` |
| SignUp mounts | `cdApi.changeContext("signup_screen")` |
| User logs in / signs up | `cdApi.setCustomerSessionId(csid)` then `setCustomerBrand("SD")` |
| Account mounts | `cdApi.changeContext("account_screen")` |
| Payment mounts | `cdApi.changeContext("payment_screen")` |

> **Why not Home?** The Home page is public — no session exists yet. Calling `changeContext` before `setCustomerSessionId` would send an un-tagged context event that the SDK cannot associate with any session. SDK calls only begin at the first authenticated screen (Login/SignUp).

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

### 7 — CSS Modules — shared base, scoped additions
Styles are co-located with their component and locally scoped. `src/styles/form.module.css` defines the shared form layout (page, card, inputs, button). Login and SignUp import it directly. Payment imports the shared base plus its own module for additions. All color and spacing values are CSS variables defined once in `index.css (:root)` — no hardcoded hex values in component files. All interactive states (disabled, focus) are handled by CSS pseudo-selectors, not inline styles.

### 8 — `localStorage` DB — no backend
Users and transactions persist across sessions without any server. `bc_users` stores email, password (plain text — demo only, no real auth), and balances. `bc_transactions_{email}` stores that user's transaction history. Each transaction carries a UUID so React keys are always stable. Logout does not wipe the DB — data persists for the next login.

### 9 — Context API, not Redux
Three values (`user`, `csid`, `initDone`), one linear flow. Redux adds boilerplate with no architectural benefit here.

### 10 — Dead CSID on API failure is a known, accepted edge case
If `triggerInit` fails after `startSession` has already run, the CSID is written to `sessionStorage` and sent to the SDK — but `completeAuth` is never called, so `user` stays `null` and `initDone` stays `false`. The user sees an error and stays on the login page. The "dead" CSID remains in `sessionStorage` until the next successful login overwrites it or the tab closes.

This is acceptable because: the SDK has already tagged that CSID as the session; overwriting it on retry with a new CSID would split the behavioral data across two IDs. Keeping the same CSID means if the user retries and succeeds, the SDK data is contiguous under one session. In production, logout explicitly calls `sessionStorage.removeItem('csid')` to ensure a clean state.

---

## Demo Video Flow (~3 minutes)

1. Open app → Home → DevTools Console: `changeContext → home_screen`
2. Click "Sign Up" → fill email + password → Create Account → CSID generated, `init` fires
3. Redirect to Account → $24,750 checking balance, empty transaction list
4. Click "Make a Payment" → fill form → Confirm → `getScore` fires + balance deducted
5. Click "View Transactions" → payment appears at top of list
6. Logout → login again with same credentials → balance and transactions restored from DB
7. DevTools Network → show `init` payload → show `getScore` payload

---

## Screenshots

### Payment — successful `getScore` call with full console trace

![Payment page showing successful $100 transfer with DevTools console displaying the complete SDK and API flow](screenshots/payment-success-console.png)

The console trace shows the full sequence:
- `[App→SDK] changeContext → login_screen` — context set on page mount
- `[Auth] New CSID generated` — fresh UUID on login
- `[App→SDK] setCustomerSessionId` + `setCustomerBrand` — SDK informed
- `[HTTP] POST …/bgwofce/` with `action: "init"` — login triggers init
- `[Auth] Session confirmed` — `initDone` set to `true`
- `[App→SDK] changeContext → account_screen` → `payment_screen` — context switches per route
- `[HTTP] POST …/bgwofce/` with `action: "getScore"` — payment triggers scoring

---

### Account Overview — balance updated + transaction history

![Account Overview showing updated checking balance and recent transactions list with Session Debug expanded](screenshots/account-after-payment.png)

Shows the balance after multiple payments, the transaction list with debit amounts in red, and the Session Debug panel exposing the active CSID for verification.
