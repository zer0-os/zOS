import { apiUrl, post } from '../../../../../lib/api/rest';

export const useEpicGamesLink = () => {
  const handle = async () => {
    try {
      const response = await post<any>('/api/oauth/generate-link-token');
      const returnUrl = window.location.origin + '/oauth/callback';

      const data = response.body;
      const { linkToken } = data;

      if (linkToken) {
        const url = new URL(apiUrl('/api/oauth/link/epic-games/initiate'));
        url.searchParams.append('linkToken', linkToken);
        url.searchParams.append('returnUrl', returnUrl);
        window.open(url.toString(), '_blank', 'width=800,height=900,popup');
      } else {
        console.error('authorizationURL not found in response');
      }
    } catch (error: any) {
      throw new Error('Error initiating Epic Games link:', error.response.body);
    }
  };

  return handle;
};
