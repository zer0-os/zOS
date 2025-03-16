enum ZAppMessageType {
  RouteChange = 'zapp-route-changed',
  Authenticate = 'zapp-authenticate',
  ChannelHandshake = 'zapp-channel-handshake',
}

enum ZOSMessageType {
  Authenticate = 'zos-authenticate',
  ChannelHandshakeResponse = 'zos-channel-handshake-response',
}

type RouteChangeMessage = {
  type: ZAppMessageType.RouteChange;
  data: {
    pathname: string;
  };
};

type AuthenticateMessage = {
  type: ZAppMessageType.Authenticate;
};

type ChannelHandshakeMessage = {
  type: ZAppMessageType.ChannelHandshake;
};

type IncomingMessage = RouteChangeMessage | AuthenticateMessage | ChannelHandshakeMessage;

type AuthenticateResponseMessage = {
  type: ZOSMessageType.Authenticate;
  token: string | null;
  error?: string;
};

type ChannelHandshakeResponseMessage = {
  type: ZOSMessageType.ChannelHandshakeResponse;
  port: MessagePort;
};

type OutgoingMessage = AuthenticateResponseMessage | ChannelHandshakeResponseMessage;

export type {
  IncomingMessage,
  OutgoingMessage,
  RouteChangeMessage,
  AuthenticateMessage,
  AuthenticateResponseMessage,
  ChannelHandshakeMessage,
  ChannelHandshakeResponseMessage,
};
export { ZAppMessageType, ZOSMessageType };
