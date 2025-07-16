import { apiUrl } from '../../../lib/api/rest';

export const useOAuthFlow = () => {
  return async (connector: string) => {
    const returnUrl = window.location.origin + '/oauth/callback';
    const url = new URL(apiUrl(`/api/oauth/${connector}/login`));
    url.searchParams.append('returnUrl', returnUrl);
    window.location.href = url.toString();
  };
};
