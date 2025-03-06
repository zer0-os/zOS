import { AuthenticateMessage, AuthenticateResponseMessage, ZAppMessageType } from '../types/types';
import { WHITELISTED_APPS } from '../constants/whitelistedApps';

/**
 * Give the app access to the user's access token. This is only allowed for whitelisted apps.
 * In the future, we'll create a new token for each app that has specific permissions
 * that the user can opt-in to.
 *
 * @param event
 */
export const authenticateHandler = (event: MessageEvent<AuthenticateMessage>) => {
  const { origin } = new URL(event.origin);

  if (!WHITELISTED_APPS.includes(origin)) {
    return;
  }

  // To implement getting user token
  const token = '';

  const response: AuthenticateResponseMessage = {
    type: ZAppMessageType.Authenticate,
    token,
  };

  // Send the response back to the iframe that sent the message
  if (event.source && event.source instanceof Window) {
    event.source.postMessage(response, event.origin);
  }
};
