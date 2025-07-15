import { apiUrl } from '../../../lib/api/rest';

export const useOAuthFlow = () => {
  return async (connector: string) => {
    try {
      const returnUrl = window.location.origin + '/oauth/callback';
      const url = new URL(apiUrl(`/api/oauth/${connector}/login`));
      url.searchParams.append('returnUrl', returnUrl);
      window.location.href = url.toString();
    } catch (error: any) {
      throw new Error(`Error initiating Epic Games link: ${error.response?.body || 'No additional details available'}`);
    }
  };
};
