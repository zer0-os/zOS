import {
  ZAppMessageType,
  IncomingMessage,
  RouteChangeMessage,
  SubmitManifestMessage,
  AuthenticateMessage,
} from './types';

export function isRouteChangeEvent(event: MessageEvent<IncomingMessage>): event is MessageEvent<RouteChangeMessage> {
  return event.data.type === ZAppMessageType.RouteChange;
}

export function isSubmitManifestEvent(
  event: MessageEvent<IncomingMessage>
): event is MessageEvent<SubmitManifestMessage> {
  return event.data.type === ZAppMessageType.SubmitManifest;
}

export function isAuthenticateEvent(event: MessageEvent<IncomingMessage>): event is MessageEvent<AuthenticateMessage> {
  return event.data.type === ZAppMessageType.Authenticate;
}
