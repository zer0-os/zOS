# Billing Service Web App Integration Design

**Date:** 2026-01-27
**Status:** Approved
**Author:** Claude (with user collaboration)

## Overview

Update the `zos` web app to call the billing microservice directly for subscription operations instead of going through `zos-api`.

## Decisions Made

| Decision          | Choice                                                          |
| ----------------- | --------------------------------------------------------------- |
| API routing       | Direct calls to billing microservice                            |
| URL configuration | Separate environment variable (`REACT_APP_BILLING_SERVICE_URL`) |
| Route structure   | Match billing service routes exactly                            |
| Authentication    | Keep same Bearer token pattern                                  |
| Response handling | Adapt hooks to new response format                              |

## Scope

### What's Changing

- 4 custom hooks that make subscription API calls
- 1 config file (add billing service URL)
- 1 API client file (add billing service helpers)
- TypeScript types for API responses

### What's NOT Changing

- Stripe integration (payment form, Elements)
- Redux state management for user subscriptions
- UI components and flow
- All other API calls (still go to zos-api)

### Files to Modify

```
src/config.ts
src/lib/api/rest.ts
src/components/messenger/user-profile/zero-pro-panel/useActivateZeroProSubscription.ts
src/components/messenger/user-profile/zero-pro-panel/useStatusZeroProSubscription.ts
src/components/messenger/user-profile/zero-pro-panel/useCancelZeroProSubscription.ts
src/components/messenger/user-profile/zero-pro-panel/usePollZeroProStatus.ts
```

## Technical Design

### 1. Configuration Changes

**`src/config.ts`:**

```typescript
export const config = {
  // ... existing config
  ZERO_API_URL: process.env.REACT_APP_ZERO_API_URL,
  BILLING_SERVICE_URL: process.env.REACT_APP_BILLING_SERVICE_URL,
  // ...
};
```

### 2. API Client Changes

**`src/lib/api/rest.ts`:**

```typescript
// New helper for billing service URLs
export function billingApiUrl(path: string): string {
  return [config.BILLING_SERVICE_URL, path].join('');
}

// New billing-specific request functions
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

### 3. Route Mapping

| Old Route (zos-api)              | New Route (billing service)   | Method |
| -------------------------------- | ----------------------------- | ------ |
| `/subscription/status?type=ZERO` | `/subscriptions/me?type=ZERO` | GET    |
| `/subscription/zero-pro`         | `/subscriptions/zero-pro`     | POST   |
| `/subscription/cancel`           | `/subscriptions/zero-pro`     | DELETE |

### 4. Hook Changes

#### `useStatusZeroProSubscription.ts`

```typescript
// Before
const response = await get('/subscription/status?type=ZERO');

// After
const response = await billingGet('/subscriptions/me?type=ZERO');
```

**New Response Type:**

```typescript
interface ZeroProStatusResponse {
  subscription: {
    type: string;
    status: string;
    isActive: boolean;
    currentPeriodEnd: string | null;
    subscribedAt: string | null;
    cancelledAt: string | null;
  } | null;
}
```

#### `usePollZeroProStatus.ts`

```typescript
// Before
const response = await get('/subscription/status?type=ZERO');
const status = data.subscription?.status ?? data.status;

// After
const response = await billingGet('/subscriptions/me?type=ZERO');
const isActive = data.subscription?.isActive ?? false;
```

#### `useActivateZeroProSubscription.ts`

```typescript
// Before
const response = await post('/subscription/zero-pro').send({...});

// After
const response = await billingPost('/subscriptions/zero-pro').send({...});
```

#### `useCancelZeroProSubscription.ts`

```typescript
// Before
const response = await post('/subscription/cancel');

// After
const response = await billingDelete('/subscriptions/zero-pro');
```

**New Response Type:**

```typescript
interface CancelResponse {
  cancelled: boolean;
  currentPeriodEnd: string | null;
}
```

## CORS Configuration

The billing service has CORS enabled. For production, restrict to specific origins:

```typescript
await server.register(cors, {
  origin: ['https://zos.zero.tech', 'https://app.zero.tech'],
  credentials: true,
});
```

## Environment Variables

| Environment | Variable                        | Value                               |
| ----------- | ------------------------------- | ----------------------------------- |
| Development | `REACT_APP_BILLING_SERVICE_URL` | `http://localhost:3001`             |
| Staging     | `REACT_APP_BILLING_SERVICE_URL` | `https://billing-staging.zero.tech` |
| Production  | `REACT_APP_BILLING_SERVICE_URL` | `https://billing.zero.tech`         |

## Deployment Order

1. Deploy billing service (already done)
2. Update Stripe webhook URL to point to billing service
3. Deploy web app with new environment variable
4. Verify subscription flows work end-to-end

## Rollback Plan

If issues arise, redeploy web app pointing `BILLING_SERVICE_URL` back to zos-api (requires re-adding subscription routes to zos-api).
