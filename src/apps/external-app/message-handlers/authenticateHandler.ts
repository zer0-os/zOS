import { AuthenticateMessage, AuthenticateResponseMessage, ZOSMessageType } from '../types/types';
import { get } from '../../../lib/api/rest';

/**
 * Give the app access to the user's access token. This is only allowed for whitelisted apps.
 * In the future, we'll create a new token for each app that has specific permissions
 * that the user can opt-in to.
 *
 * @param messagePort
 */
export const authenticateHandler = async (messagePort: MessagePort | null) => {
  try {
    const response = await get('/api/users/current-token');
    if (!response.ok) {
      throw new Error('Failed to fetch access token');
    }
    const { accessToken } = response.body;

    const responseMessage: AuthenticateResponseMessage = {
      type: ZOSMessageType.Authenticate,
      token: accessToken,
    };

    if (messagePort) {
      messagePort.postMessage(responseMessage);
    }
  } catch (error) {
    console.error('Failed to fetch access token:', error);
    if (messagePort) {
      messagePort.postMessage({
        type: ZOSMessageType.Authenticate,
        token: null,
        error: 'Failed to authenticate',
      });
    }
  }
};
