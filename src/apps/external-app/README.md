# External App Integration

This module handles the integration of external applications (zApps) within the zOS platform. It provides a secure way to embed third-party applications while maintaining control over their capabilities and communication.

## Manifest System

The manifest system allows external apps to declare their capabilities and features to the zOS platform. Each app must submit a manifest that describes what it can do.

### Manifest Structure

```typescript
type ZAppManifest = {
  name: string; // The name of the application
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

#### From External App to zOS

1. **Route Change** (`zapp-route-changed`)

   - Purpose: Synchronize navigation between the external app and zOS
   - Structure:
     ```typescript
     {
       type: 'zapp-route-changed',
       data: {
         pathname: string
       }
     }
     ```

2. **Submit Manifest** (`zapp-submit-manifest`)

   - Purpose: Register app capabilities with zOS
   - Structure:
     ```typescript
     {
       type: 'zapp-submit-manifest',
       manifest: string  // JSON stringified manifest
     }
     ```

3. **Authenticate** (`zapp-authenticate`)
   - Purpose: Request user authentication token
   - Structure:
     ```typescript
     {
       type: 'zapp-authenticate';
     }
     ```

#### From zOS to External App

1. **Manifest Response** (`zos-manifest-received`)

   - Purpose: Acknowledge manifest submission
   - Structure:
     ```typescript
     {
       type: 'zos-manifest-received',
       status: 'success' | 'error',
       error?: string
     }
     ```

2. **Authenticate Response** (`zapp-authenticate`)
   - Purpose: Provide authentication token
   - Structure:
     ```typescript
     {
       type: 'zapp-authenticate',
       token: string
     }
     ```

## Usage Example

```typescript
// In your external app
const manifest = {
  name: 'My App',
  features: [{ type: 'fullscreen' }],
};

// Submit manifest
window.parent.postMessage(
  {
    type: 'zapp-submit-manifest',
    manifest: JSON.stringify(manifest),
  },
  '*'
);

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
    case 'zos-manifest-received':
      if (message.status === 'success') {
        console.log('Manifest was accepted by zOS');
      } else {
        console.error('Manifest was rejected:', message.error);
      }
      break;

    case 'zapp-authenticate':
      // Store the authentication token
      const token = message.token;
      // Use the token for authenticated requests
      break;
  }
});
```
