import { ZAppMessageType, IncomingMessage, RouteChangeMessage, ChannelHandshakeMessage } from './types';

export function isRouteChangeEvent(event: MessageEvent<IncomingMessage>): event is MessageEvent<RouteChangeMessage> {
  return event.data.type === ZAppMessageType.RouteChange;
}

export function isChannelHandshakeEvent(
  event: MessageEvent<IncomingMessage>
): event is MessageEvent<ChannelHandshakeMessage> {
  return event.data.type === ZAppMessageType.ChannelHandshake;
}
