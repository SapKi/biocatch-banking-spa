# SecureBank – BioCatch Take-Home Assignment

A React + TypeScript SPA that simulates a banking user journey and integrates the BioCatch behavioral-biometrics SDK.

---

## Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (bundled with Node.js)

Verify your versions:

```bash
node -v   # should print v18.x.x or higher
npm -v    # should print 9.x.x or higher
```

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/SapKi/biocatch-banking-spa.git
cd biocatch-banking-spa

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Other commands

```bash
npm run build    # production build + TypeScript type check
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

---

## User Flow

```
Home → Login → Account Overview → Make Payment → Logout
```

Any non-empty username and password will log you in (auth is simulated).

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
│   ├── types.ts                # Shared interfaces and union types
│   ├── global.d.ts             # CdApi interface + Window.cdApi declaration
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Session state: user, CSID, initDone flag
│   │
│   ├── services/
│   │   ├── sdkService.ts       # Thin wrapper around window.cdApi
│   │   └── apiService.ts       # All fetch calls — triggerInit, triggerGetScore
│   │
│   ├── hooks/
│   │   └── useSDKContext.ts    # Per-page hook: calls changeContext on mount
│   │
│   ├── utils/
│   │   └── uuid.ts             # UUID generator (crypto.randomUUID + fallback)
│   │
│   ├── components/
│   │   ├── Navbar.tsx          # Top nav with logout
│   │   ├── ProtectedRoute.tsx  # Auth guard — redirects to /login
│   │   └── StatusBadge.tsx     # Loading / success / error feedback UI
│   │
│   └── pages/
│       ├── Home.tsx            # Landing page
│       ├── Login.tsx           # Login form — triggers init API call
│       ├── Account.tsx         # Account overview (protected)
│       └── Payment.tsx         # Payment form — triggers getScore API call
```

---

## Architecture Decisions

### 1. SDK loaded in `index.html` — not lazily in React

```html
<script src="https://bcdn-4ff4f23f.we-stats.com/scripts/4ff4f23f/4ff4f23f.js" defer></script>
```

Loading the SDK in `<head defer>` guarantees `window.cdApi` exists before the React bundle executes. Lazy-loading inside a component creates a race condition — the first `changeContext` call would fire before `cdApi` is ready.

The `<meta name="isHybrid" content="false">` tag is also required — the SDK reads it on load to choose its web vs. native branch.

### 2. CSID stored in `sessionStorage`

`sessionStorage` is cleared when the tab closes — correct for a banking session. A new tab = a new session = a new CSID. `localStorage` would persist across tabs and browser restarts, so the same CSID would follow the user across logically separate sessions.

Flow:
```
Login  → generateUUID() → sessionStorage.setItem → cdApi.setCustomerSessionId(csid)
Logout → sessionStorage.removeItem('csid') → initDone reset to false
Next login → fresh UUID
```

### 3. `initDone` gates getScore

`AuthContext` holds an `initDone: boolean` that starts `false`. It is set to `true` only after `triggerInit()` resolves successfully on login. The Payment page reads `initDone` and blocks submission if it is `false` — enforced at the data layer, not just in the UI.

### 4. SDK context changes are per-page hooks

Each page calls `useSDKContext("screen_name")`. The hook wraps `changeContext` in `useEffect` with an empty dependency array — fires exactly once, on mount. Context changes are tied to React Router's mount/unmount lifecycle. No central route-watcher needed; each page owns its SDK context.

### 5. API layer is separated from UI

`apiService.ts` owns the endpoint URL, headers, payload shape, and logging. Pages call named functions (`triggerInit`, `triggerGetScore`) — they never construct `fetch` calls directly. The `Action` and `ActivityType` union types make the allowed values explicit at the call site.

### 6. TypeScript with strict mode

All shared contracts live in `src/types.ts`. `window.cdApi` is typed via `global.d.ts` using a `Window` interface augmentation — no `any` casts needed in service code. `strict: true` catches implicit `any`, unchecked null access, and unused variables at compile time.

### 7. Context API instead of Redux

The state is a single linear session: unauthenticated → authenticated → init done. Three values total. Redux would add boilerplate with no benefit here.

---

## API Flow

| User action  | Function          | `action`     | `activityType` |
|--------------|-------------------|--------------|----------------|
| Click Login  | `triggerInit`     | `"init"`     | `"LOGIN"`      |
| Click Pay    | `triggerGetScore` | `"getScore"` | `"PAYMENT"`    |

Both POST to: `https://hooks.zapier.com/hooks/catch/1888053/bgwofce/`

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

## SDK Calls Summary

| Event          | SDK call                                |
|----------------|-----------------------------------------|
| Page: Home     | `cdApi.changeContext("home_screen")`    |
| Page: Login    | `cdApi.changeContext("login_screen")`   |
| User logs in   | `cdApi.setCustomerSessionId(csid)`      |
| Page: Account  | `cdApi.changeContext("account_screen")` |
| Page: Payment  | `cdApi.changeContext("payment_screen")` |

---

## Observability — Browser Console

Open **DevTools → Console**. You will see:

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

To verify the full payload, open **DevTools → Network**, filter by `bgwofce`, and inspect the request body.

---

## Screenshots to Capture

1. **Home page** — hero section with "Get Started" button
2. **Login page** — form with fields filled in
3. **Login loading state** — "Signing in…" status badge
4. **Account page** — account cards + transaction table
5. **Payment page** — form filled in
6. **Payment success** — green status badge
7. **DevTools Console** — showing all `[SDK]` and `[API]` log lines
8. **DevTools Network** — POST to Zapier with full JSON payload visible

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

## Demo Video Flow (~3 minutes)

1. Open the app → Home page → DevTools Console: `changeContext → home_screen`
2. Click "Get Started" → Login page → `changeContext → login_screen`
3. Type any credentials → click Sign In → CSID generated, `init` API fires, success badge
4. Auto-redirect to Account → account cards + transactions + console log
5. Click "Make a Payment" → fill form → Confirm → `getScore` fires + success badge
6. Click Logout → back to Home → log in again → **new CSID** appears in console
7. DevTools Network → inspect the `init` request body — show full JSON payload

---

## Notes

- No real authentication — any non-empty username/password logs in.
- Account balances and transactions are static mock data.
- The Zapier webhook accepts any valid JSON; a real integration would parse the score from the response and act on it.
