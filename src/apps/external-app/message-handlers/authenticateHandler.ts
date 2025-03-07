import { AuthenticateMessage, AuthenticateResponseMessage, ZOSMessageType } from '../types/types';
import { WHITELISTED_APPS } from '../constants/whitelistedApps';

/**
 * Give the app access to the user's access token. This is only allowed for whitelisted apps.
 * In the future, we'll create a new token for each app that has specific permissions
 * that the user can opt-in to.
 *
 * @param event
 */
export const authenticateHandler = async (event: MessageEvent<AuthenticateMessage>) => {
  const { origin } = new URL(event.origin);

  if (!WHITELISTED_APPS.includes(origin)) {
    return;
  }

  try {
    // todo: get the access token from the server
    const responseMessage: AuthenticateResponseMessage = {
      type: ZOSMessageType.Authenticate,
      token: '',
    };

    // Send the response back to the iframe that sent the message
    if (event.source && event.source instanceof Window) {
      event.source.postMessage(responseMessage, event.origin);
    }
  } catch (error) {
    console.error('Failed to get access token:', error);
    if (event.source && event.source instanceof Window) {
      event.source.postMessage(
        {
          type: ZOSMessageType.Authenticate,
          token: null,
          error: 'Failed to get access token',
        },
        event.origin
      );
    }
  }
};
