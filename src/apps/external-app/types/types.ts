enum ZAppMessageType {
  RouteChange = 'zapp-route-changed',
  SubmitManifest = 'zapp-submit-manifest',
  Authenticate = 'zapp-authenticate',
}

enum ZOSMessageType {
  ManifestReceived = 'zos-manifest-received',
}

type RouteChangeMessage = {
  type: ZAppMessageType.RouteChange;
  data: {
    pathname: string;
  };
};

type SubmitManifestMessage = {
  type: ZAppMessageType.SubmitManifest;
  manifest: string;
};

type AuthenticateMessage = {
  type: ZAppMessageType.Authenticate;
};

type IncomingMessage = RouteChangeMessage | SubmitManifestMessage | AuthenticateMessage;

type ManifestResponseMessage = {
  type: ZOSMessageType.ManifestReceived;
  status: 'success' | 'error';
  error?: string;
};

type AuthenticateResponseMessage = {
  type: ZAppMessageType.Authenticate;
  token: string;
};

type OutgoingMessage = ManifestResponseMessage | AuthenticateResponseMessage;

export type {
  IncomingMessage,
  OutgoingMessage,
  RouteChangeMessage,
  SubmitManifestMessage,
  AuthenticateMessage,
  ManifestResponseMessage,
  AuthenticateResponseMessage,
};
export { ZAppMessageType, ZOSMessageType };
