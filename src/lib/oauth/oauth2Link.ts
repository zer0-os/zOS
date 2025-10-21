import { apiUrl, post } from '../api/rest';

export const oauth2Link = async (provider: string, popup: boolean = true) => {
  try {
    const response = await post<any>('/api/oauth/generate-link-token');
    const returnUrl = window.location.origin + '/oauth/link/callback';

    const data = response.body;
    const { linkToken } = data;

    if (linkToken) {
      const url = new URL(apiUrl(`/api/oauth/link/${provider}/initiate`));
      url.searchParams.append('linkToken', linkToken);
      url.searchParams.append('returnUrl', returnUrl);
      if (popup) {
        const newWindow = window.open(url.toString(), '_blank', 'width=800,height=900,popup');
        if (!newWindow) {
          window.location.href = url.toString();
        }
      } else {
        window.location.href = url.toString();
      }
    } else {
      console.error('authorizationURL not found in response');
    }
  } catch (error: any) {
    console.error(error);
    throw new Error(`Error initiating ${provider} link: ${error.response?.body || 'No additional details available'}`);
  }
};
