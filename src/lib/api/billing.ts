import * as Request from 'superagent';
import { config } from '../../config';
import { featureFlags } from '../feature-flags';

/**
 * Path mapping from zos-api paths to billing service paths.
 * When the billing service feature flag is enabled, these paths
 * are rewritten to use the billing service API format.
 */
const pathMapping: Record<string, string> = {
  '/subscription/zero-pro': '/api/subscriptions/zero-pro',
  '/subscription/status': '/api/subscriptions/status',
  '/subscription/cancel': '/api/subscriptions/cancel',
};

/**
 * Get the appropriate URL for a billing-related API call.
 * When the billing service is enabled, routes to the billing microservice
 * with path translation. Otherwise, falls back to zos-api.
 */
function getBillingUrl(path: string): string {
  if (featureFlags.enableBillingService && config.billingServiceUrl) {
    // Extract path without query string for mapping lookup
    const pathWithoutQuery = path.split('?')[0];
    const mappedPath = pathMapping[pathWithoutQuery] || path;
    // Preserve query string if present
    const queryString = path.includes('?') ? path.substring(path.indexOf('?')) : '';
    return config.billingServiceUrl + mappedPath + queryString;
  }
  // Fallback to zos-api
  return config.ZERO_API_URL + path;
}

/**
 * Platform header to ensure cookie scope matches zos user.
 */
const platformHeader = { 'X-APP-PLATFORM': 'zos' };

/**
 * Auth header for Bearer token authentication.
 * Used for Vercel preview environments and localStorage token fallback.
 */
let authHeader: Record<string, string> = {};
if (typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
  authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

let billingTokenCache: { token: string; expiresAt: number } | null = null;

async function getBillingAuthHeader(): Promise<Record<string, string>> {
  if (authHeader.Authorization) {
    return authHeader;
  }

  if (!featureFlags.enableBillingService || !config.billingServiceUrl) {
    return authHeader;
  }

  if (billingTokenCache && Date.now() < billingTokenCache.expiresAt) {
    return { Authorization: `Bearer ${billingTokenCache.token}` };
  }

  const response = await Request.get(`${config.ZERO_API_URL}/accounts/billingToken`)
    .set(platformHeader)
    .withCredentials();

  if (!response.ok || !response.body?.token) {
    throw new Error(response.body?.message || 'Failed to fetch billing token');
  }

  const expiresInSeconds = response.body.expiresIn ?? 0;
  const refreshBufferMs = 30_000;
  billingTokenCache = {
    token: response.body.token,
    expiresAt: Date.now() + expiresInSeconds * 1000 - refreshBufferMs,
  };

  return { Authorization: `Bearer ${billingTokenCache.token}` };
}

/**
 * Make a GET request to the billing service or zos-api.
 */
export async function get<T>(path: string, query?: Record<string, any>) {
  const billingAuthHeader = await getBillingAuthHeader();
  const request = Request.get<T>(getBillingUrl(path)).set(billingAuthHeader).set(platformHeader).withCredentials();

  if (query) {
    request.query(query);
  }
  return await request;
}

/**
 * Make a POST request to the billing service or zos-api.
 */
export async function post<T>(path: string, body?: Record<string, any>) {
  const billingAuthHeader = await getBillingAuthHeader();
  const request = Request.post<T>(getBillingUrl(path)).set(billingAuthHeader).set(platformHeader).withCredentials();
  if (body) {
    request.send(body);
  }
  return await request;
}
