# SecureBank – BioCatch Take-Home Assignment

A React SPA that simulates a banking user journey and integrates the BioCatch behavioral-biometrics SDK.

---

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Folder Structure

```
biocatch-banking-spa/
├── index.html                  # SDK script tag lives here (see note below)
├── src/
│   ├── main.jsx                # Entry: BrowserRouter + AuthProvider + App
│   ├── App.jsx                 # Route definitions + layout shell
│   ├── index.css               # Minimal global reset
│   │
│   ├── context/
│   │   └── AuthContext.jsx     # Session state: user, CSID, initDone flag
│   │
│   ├── services/
│   │   ├── sdkService.js       # Thin wrapper around window.cdApi
│   │   └── apiService.js       # All fetch calls (init, getScore)
│   │
│   ├── hooks/
│   │   └── useSDKContext.js    # Per-page hook that calls changeContext on mount
│   │
│   ├── utils/
│   │   └── uuid.js             # UUID generator (crypto.randomUUID + fallback)
│   │
│   ├── components/
│   │   ├── Navbar.jsx          # Top nav with logout
│   │   ├── ProtectedRoute.jsx  # Auth guard (redirects to /login)
│   │   └── StatusBadge.jsx     # Loading / success / error feedback UI
│   │
│   └── pages/
│       ├── Home.jsx            # Landing page
│       ├── Login.jsx           # Login form — triggers init API
│       ├── Account.jsx         # Account overview (protected)
│       └── Payment.jsx         # Payment form — triggers getScore API
```

---

## Architecture Decisions

### 1. SDK loaded in `index.html` (not lazily in React)

```html
<script src="https://bcdn-4ff4f23f.we-stats.com/scripts/4ff4f23f/4ff4f23f.js" defer></script>
```

**Why:** The SDK must be ready before any React component mounts. Loading it in `<head defer>` guarantees `window.cdApi` exists by the time the React bundle executes. Lazy-loading it inside a component creates a race condition where the first page's `changeContext` call would fire before `cdApi` exists.

The `<meta name="isHybrid" content="false">` tag is also required — the SDK reads it on load to choose its web vs. native branch.

### 2. CSID stored in `sessionStorage`

**Why:** `sessionStorage` is cleared when the tab closes, which matches banking session semantics. A new tab = a new session = a new CSID. `localStorage` would persist across tabs and browser restarts, meaning the same CSID would follow the user across logically separate sessions — incorrect for fraud detection.

Flow:
- Login → `generateUUID()` → stored in `sessionStorage` → `cdApi.setCustomerSessionId(csid)`
- Logout → `sessionStorage.removeItem('csid')` → `csid` state reset
- Next login → fresh UUID

### 3. `AuthContext` gates getScore behind initDone

The requirement is: **getScore must only run after init succeeds.**

`AuthContext` holds an `initDone` boolean that starts `false`. It is set to `true` only inside `Login.jsx` after `triggerInit()` resolves. The Payment page reads `initDone` and blocks submission if it's false. This is enforced at the data layer, not just in the UI.

### 4. SDK context changes are per-page hooks

Each page calls `useSDKContext("screen_name")` — a custom hook that wraps `changeContext` in a `useEffect` with an empty dependency array. This means:
- The call fires exactly once, on mount.
- Context changes are coupled to route changes (React Router mounts/unmounts pages on navigation).
- No central route-watcher needed; each page owns its own SDK context declaration.

### 5. API layer is separated from UI

`apiService.js` owns the endpoint URL, headers, payload shape, and logging. Pages call named functions (`triggerInit`, `triggerGetScore`) — they never construct `fetch` calls directly. This makes it trivial to add retry logic, auth headers, or swap the endpoint without touching any page component.

### 6. Context API instead of Redux

The state is a single linear session: unauthenticated → authenticated → (optionally) init done. Three values total. Redux would add boilerplate with no architectural benefit here. Context + `useState` is sufficient and easier to explain in an interview.

---

## API Flow

| User action  | API call          | Payload `action` | Payload `activityType` |
|--------------|-------------------|------------------|------------------------|
| Click Login  | `triggerInit`     | `"init"`         | `"LOGIN"`              |
| Click Pay    | `triggerGetScore` | `"getScore"`     | `"PAYMENT"`            |

Both POST to: `https://hooks.zapier.com/hooks/catch/1888053/bgwofce/`

---

## SDK Calls Summary

| Event          | SDK call                                |
|----------------|-----------------------------------------|
| Page: Home     | `cdApi.changeContext("home_screen")`    |
| Page: Login    | `cdApi.changeContext("login_screen")`   |
| User logs in   | `cdApi.setCustomerSessionId(csid)`      |
| Page: Account  | `cdApi.changeContext("account_screen")` |
| Page: Payment  | `cdApi.changeContext("payment_screen")` |

---

## Observability / Debugging

Open DevTools Console. You will see:

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

---

## Screenshots to Capture

1. **Home page** — landing hero with "Get Started" button
2. **Login page** — form with fields filled in
3. **Login loading state** — "Signing in…" status badge
4. **Account page** — account cards + transaction table
5. **Payment page** — form filled in
6. **Payment success** — green status badge
7. **DevTools Console** — showing all SDK and API log lines
8. **DevTools Network** — POST to Zapier with full payload visible

---

## Suggested Git Commit Structure

```
feat: scaffold Vite React app with react-router-dom
feat: add AuthContext with CSID lifecycle management
feat: add sdkService wrapper and index.html SDK script tag
feat: add apiService with triggerInit and triggerGetScore
feat: add useSDKContext hook for per-page context changes
feat: implement Home, Login, Account, Payment pages
feat: add ProtectedRoute and Navbar components
docs: add README with architecture explanation
```

---

## Demo Video Flow (suggested ~3 min)

1. Open the app → Home page loads → show console: `changeContext → home_screen`
2. Click "Get Started" → Login page → show console: `changeContext → login_screen`
3. Type credentials → click Sign In → show: CSID generated, init API call, success badge
4. Auto-redirect to Account → show account cards + transactions + console log
5. Click "Make a Payment" → fill form → click Confirm → show getScore API call + success
6. Click Logout → redirected to Home → log in again → show a **new** CSID in console
7. Open DevTools Network → replay the init request → show full JSON payload

---

## Notes

- No real auth — any non-empty username/password logs in.
- Balances and transactions are static mock data.
- The Zapier webhook accepts any payload; a real integration would validate a score response and act on it.
