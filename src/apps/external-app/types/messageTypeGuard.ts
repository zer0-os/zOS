import {
  ZAppMessageType,
  IncomingMessage,
  RouteChangeMessage,
  AuthenticateMessage,
  ChannelHandshakeMessage,
} from './types';

export function isRouteChangeEvent(event: MessageEvent<IncomingMessage>): event is MessageEvent<RouteChangeMessage> {
  return event.data.type === ZAppMessageType.RouteChange;
}

export function isAuthenticateEvent(event: MessageEvent<IncomingMessage>): event is MessageEvent<AuthenticateMessage> {
  return event.data.type === ZAppMessageType.Authenticate;
}

export function isChannelHandshakeEvent(
  event: MessageEvent<IncomingMessage>
): event is MessageEvent<ChannelHandshakeMessage> {
  return event.data.type === ZAppMessageType.ChannelHandshake;
}
