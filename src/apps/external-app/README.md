# External App Integration

This module handles the integration of external applications (zApps) within the zOS platform. It provides a secure way to embed third-party applications while maintaining control over their capabilities and communication.

## Manifest System

The manifest system allows external apps to declare their capabilities and features to the zOS platform. Each app must provide a manifest that describes what it can do.

### Manifest Structure

```typescript
type ZAppManifest = {
  title: string; // The title of the application
  route: `/${string}`; // The base route where the app will be mounted
  url: string; // The URL where the app is hosted
  features: ZAppFeature[]; // List of features the app supports
};
```

## Features

Features are capabilities that can change how an app interacts with zOS. Currently supported features:

### Fullscreen

- Type: `'fullscreen'`
- Description: Changes the AppBar to be on top of the iframe instead of on the side
- Usage: Add `{ type: 'fullscreen' }` to the features array in the manifest

## Message System

The external app integration uses a message-based communication system between the parent window (zOS) and the iframe (external app).

### Message Types

#### From External App to zOS (Incoming Messages)

1. **Route Change** (`zapp-route-changed`)

   ```typescript
   type RouteChangeMessage = {
     type: 'zapp-route-changed';
     data: {
       pathname: string;
     };
   };
   ```

2. **Authenticate** (`zapp-authenticate`)
   ```typescript
   type AuthenticateMessage = {
     type: 'zapp-authenticate';
   };
   ```

#### From zOS to External App (Outgoing Messages)

2. **Authenticate Response** (`zos-authenticate`)
   ```typescript
   type AuthenticateResponseMessage = {
     type: 'zos-authenticate';
     token: string | null;
     error?: string;
   };
   ```

## Usage Example

```typescript
// In your external app
window.addEventListener('message', (event) => {
  // Verify the message is from zOS
  if (event.origin !== 'https://zos.zero.tech') {
    return;
  }

  const message = event.data;

  switch (message.type) {
    case 'zos-authenticate':
      if (message.token) {
        // Handle successful authentication
        console.log('Received authentication token');
      } else {
        console.error('Authentication failed:', message.error);
      }
      break;
  }
});

// Request authentication
window.parent.postMessage(
  {
    type: 'zapp-authenticate',
  },
  '*'
);

// Notify route change
window.parent.postMessage(
  {
    type: 'zapp-route-changed',
    data: {
      pathname: '/new-route',
    },
  },
  '*'
);
```

## Listening for zOS Events

To receive messages from zOS in your external app, you'll need to set up a message event listener.

```typescript
// In your external app
window.addEventListener('message', (event) => {
  // Verify the message is from zOS
  if (event.origin !== 'https://zos.zero.tech') {
    return;
  }

  const message = event.data;

  switch (message.type) {
    case 'zapp-authenticate':
      // Store the authentication token
      const token = message.token;
      // Use the token for authenticated requests
      break;
  }
});
```
