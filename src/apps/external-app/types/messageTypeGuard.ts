import { ZAppMessageType, IncomingMessage, RouteChangeMessage, AuthenticateMessage } from './types';

export function isRouteChangeEvent(event: MessageEvent<IncomingMessage>): event is MessageEvent<RouteChangeMessage> {
  return event.data.type === ZAppMessageType.RouteChange;
}

export function isAuthenticateEvent(event: MessageEvent<IncomingMessage>): event is MessageEvent<AuthenticateMessage> {
  return event.data.type === ZAppMessageType.Authenticate;
}
