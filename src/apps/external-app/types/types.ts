import { ZAppManifest } from './manifest';

enum ZAppMessageType {
  RouteChange = 'zapp-route-changed',
  SubmitManifest = 'zapp-submit-manifest',
  Authenticate = 'zapp-authenticate',
}

enum ZOSMessageType {
  ManifestReceived = 'zos-manifest-received',
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

type ManifestResponseMessage = {
  type: ZOSMessageType.ManifestReceived;
  status: 'success' | 'error';
  error?: string;
};

type AuthenticateResponseMessage = {
  type: ZOSMessageType.Authenticate;
  token: string | null;
  error?: string;
};

type OutgoingMessage = ManifestResponseMessage | AuthenticateResponseMessage;

export type {
  IncomingMessage,
  OutgoingMessage,
  RouteChangeMessage,
  AuthenticateMessage,
  ManifestResponseMessage,
  AuthenticateResponseMessage,
};
export { ZAppMessageType, ZOSMessageType };
