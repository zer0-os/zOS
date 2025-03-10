enum ZAppMessageType {
  RouteChange = 'zapp-route-changed',
  Authenticate = 'zapp-authenticate',
}

enum ZOSMessageType {
  Authenticate = 'zos-authenticate',
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

type IncomingMessage = RouteChangeMessage | AuthenticateMessage;
type AuthenticateResponseMessage = {
  type: ZOSMessageType.Authenticate;
  token: string | null;
  error?: string;
};

type OutgoingMessage = AuthenticateResponseMessage;

export type { IncomingMessage, OutgoingMessage, RouteChangeMessage, AuthenticateMessage, AuthenticateResponseMessage };
export { ZAppMessageType, ZOSMessageType };
