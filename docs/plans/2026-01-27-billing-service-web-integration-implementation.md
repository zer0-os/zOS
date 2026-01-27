# Billing Service Web Integration Implementation Plan

**Goal:** Update the zos web app to call the billing microservice directly for subscription operations instead of going through zos-api.

**Architecture:** Add billing service URL configuration and API helper functions, then update 4 subscription hooks to use the new billing service endpoints with adapted response types.

**Tech Stack:** React 18, TypeScript, SuperAgent, TanStack React Query, Stripe.js

---

## Phase 1: Configuration & API Client

### Task 1: Add Billing Service URL to Config

**Files:**

- Modify: `src/config.ts`

**Step 1: Add BILLING_SERVICE_URL to config**

Add the new environment variable after `ZERO_API_URL` (line 3):

```typescript
export const config = {
  INFURA_URL: process.env.REACT_APP_INFURA_URL,
  ZERO_API_URL: process.env.REACT_APP_ZERO_API_URL,
  BILLING_SERVICE_URL: process.env.REACT_APP_BILLING_SERVICE_URL,
  // ... rest of config unchanged
```

**Step 2: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: No errors related to config

**Step 3: Commit**

```bash
git add src/config.ts
git commit -m "feat: add billing service URL to config"
```

---

### Task 2: Add Billing API Helper Functions

**Files:**

- Modify: `src/lib/api/rest.ts`

**Step 1: Add billingApiUrl helper**

Add after the existing `apiUrl` function (after line 19):

```typescript
export function billingApiUrl(path: string): string {
  return [config.BILLING_SERVICE_URL, path].join('');
}
```

**Step 2: Add billing request functions**

Add at the end of the file (after line 83):

```typescript
// Billing service API functions
export function billingGet<T>(path: string) {
  return Request.get<T>(billingApiUrl(path)).set(authHeader).withCredentials();
}

export function billingPost<T>(path: string) {
  return Request.post<T>(billingApiUrl(path)).set(authHeader).withCredentials();
}

export function billingDelete<T>(path: string) {
  return Request.delete<T>(billingApiUrl(path)).set(authHeader).withCredentials();
}
```

**Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/api/rest.ts
git commit -m "feat: add billing service API helper functions"
```

---

## Phase 2: Update Subscription Hooks

### Task 3: Update useStatusZeroProSubscription Hook

**Files:**

- Modify: `src/components/messenger/user-profile/zero-pro-panel/useStatusZeroProSubscription.ts`

**Step 1: Update imports**

Change line 2:

```typescript
// Before
import { get } from '../../../../lib/api/rest';

// After
import { billingGet } from '../../../../lib/api/rest';
```

**Step 2: Update Subscription interface**

Replace the interface (lines 4-13) with:

```typescript
interface Subscription {
  type: string;
  status: string;
  isActive: boolean;
  currentPeriodEnd: string | null;
  subscribedAt: string | null;
  cancelledAt: string | null;
}

interface ZeroProStatusResponse {
  subscription: Subscription | null;
}
```

**Step 3: Update the API call**

Change line 19:

```typescript
// Before
const response = await get('/subscription/status?type=ZERO');

// After
const response = await billingGet('/subscriptions/me?type=ZERO');
```

**Step 4: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: No errors

**Step 5: Commit**

```bash
git add src/components/messenger/user-profile/zero-pro-panel/useStatusZeroProSubscription.ts
git commit -m "feat: update useStatusZeroProSubscription to use billing service"
```

---

### Task 4: Update usePollZeroProStatus Hook

**Files:**

- Modify: `src/components/messenger/user-profile/zero-pro-panel/usePollZeroProStatus.ts`

**Step 1: Update imports**

Change line 2:

```typescript
// Before
import { get } from '../../../../lib/api/rest';

// After
import { billingGet } from '../../../../lib/api/rest';
```

**Step 2: Update the API call and status check**

Replace lines 18-29:

```typescript
// Before
const response = await get('/subscription/status?type=ZERO');
const data = response.body;
const status = data.subscription?.status ?? data.status;
if (status === 'active') {
  onActive();
  return;
}

if (status === 'cancelled') {
  onCancelled();
  return;
}

// After
const response = await billingGet('/subscriptions/me?type=ZERO');
const data = response.body;
const isActive = data.subscription?.isActive ?? false;
const status = data.subscription?.status;

if (isActive) {
  onActive();
  return;
}

if (status === 'cancelled' || status === 'canceled') {
  onCancelled();
  return;
}
```

**Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/messenger/user-profile/zero-pro-panel/usePollZeroProStatus.ts
git commit -m "feat: update usePollZeroProStatus to use billing service"
```

---

### Task 5: Update useActivateZeroProSubscription Hook

**Files:**

- Modify: `src/components/messenger/user-profile/zero-pro-panel/useActivateZeroProSubscription.ts`

**Step 1: Update imports**

Change line 4:

```typescript
// Before
import { post } from '../../../../lib/api/rest';

// After
import { billingPost } from '../../../../lib/api/rest';
```

**Step 2: Update the API call**

Change lines 46-58:

```typescript
// Before
const response = await post('/subscription/zero-pro').send({
  billingDetails: {
    email: billingDetails.email,
    name: billingDetails.name,
    address: {
      line1: billingDetails.address,
      city: billingDetails.city,
      postal_code: billingDetails.postalCode,
      country: billingDetails.country,
    },
  },
  paymentMethodId: paymentMethod.id,
});

// After
const response = await billingPost('/subscriptions/zero-pro').send({
  billingDetails: {
    email: billingDetails.email,
    name: billingDetails.name,
    address: {
      line1: billingDetails.address,
      city: billingDetails.city,
      postal_code: billingDetails.postalCode,
      country: billingDetails.country,
    },
  },
  paymentMethodId: paymentMethod.id,
});
```

**Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/messenger/user-profile/zero-pro-panel/useActivateZeroProSubscription.ts
git commit -m "feat: update useActivateZeroProSubscription to use billing service"
```

---

### Task 6: Update useCancelZeroProSubscription Hook

**Files:**

- Modify: `src/components/messenger/user-profile/zero-pro-panel/useCancelZeroProSubscription.ts`

**Step 1: Update imports**

Change line 2:

```typescript
// Before
import { post } from '../../../../lib/api/rest';

// After
import { billingDelete } from '../../../../lib/api/rest';
```

**Step 2: Update the API call**

Change line 12:

```typescript
// Before
const response = await post('/subscription/cancel');

// After
const response = await billingDelete('/subscriptions/zero-pro');
```

**Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/messenger/user-profile/zero-pro-panel/useCancelZeroProSubscription.ts
git commit -m "feat: update useCancelZeroProSubscription to use billing service"
```

---

## Phase 3: Environment & Verification

### Task 7: Update Environment Example File

**Files:**

- Modify: `.env.example` (if exists) or document in README

**Step 1: Check if .env.example exists**

Run: `ls -la .env*`

**Step 2: Add billing service URL to env example (if file exists)**

Add line:

```
REACT_APP_BILLING_SERVICE_URL=http://localhost:3001
```

**Step 3: Commit (if changes made)**

```bash
git add .env.example
git commit -m "docs: add billing service URL to env example"
```

---

### Task 8: Verify Full Build

**Step 1: Run full TypeScript check**

Run: `npm run typecheck`
Expected: No errors

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Verify no unused imports**

Run: `npm run lint` (if available)
Expected: No errors about unused imports

---

## Final Checklist

- [ ] `BILLING_SERVICE_URL` added to config.ts
- [ ] `billingGet`, `billingPost`, `billingDelete` added to rest.ts
- [ ] `useStatusZeroProSubscription` uses `/subscriptions/me`
- [ ] `usePollZeroProStatus` uses `/subscriptions/me` with `isActive` check
- [ ] `useActivateZeroProSubscription` uses `/subscriptions/zero-pro`
- [ ] `useCancelZeroProSubscription` uses DELETE `/subscriptions/zero-pro`
- [ ] TypeScript compiles without errors
- [ ] Build succeeds
- [ ] Environment variable documented

---

## Deployment Notes

1. Set `REACT_APP_BILLING_SERVICE_URL` in all environments before deploying
2. Ensure billing service CORS allows the web app origin
3. Test subscription flow end-to-end after deployment
