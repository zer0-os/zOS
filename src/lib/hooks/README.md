# React Hooks

This directory contains custom React hooks used throughout the application.

## useMatrixMedia Hook

### Overview

The `useMatrixMedia` hook is a React hook designed to handle Matrix media content efficiently. It provides a unified interface for handling both encrypted and non-encrypted media, with built-in caching and error handling.

### Features

- Automatic handling of encrypted and non-encrypted media
- Built-in caching using React Query
- Support for thumbnails
- Automatic error handling and retries
- Loading state management
- Type safety with TypeScript

### Usage

#### Basic Usage

```typescript
import { useMatrixMedia } from '../../lib/hooks/useMatrixMedia';

function MyComponent() {
  const {
    data: mediaUrl,
    isPending,
    isError,
  } = useMatrixMedia({
    url: 'mxc://matrix.org/image.jpg',
    type: MediaType.Image,
    name: 'test-image',
  });

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;

  return <img src={mediaUrl} alt='Matrix media' />;
}
```

#### Handling Encrypted Files

```typescript
const { data: mediaUrl } = useMatrixMedia({
  file: {
    url: 'mxc://matrix.org/encrypted-file',
    key: 'encryption-key',
    iv: 'initialization-vector',
    hashes: { sha256: 'file-hash' },
  },
  type: MediaType.File,
  mimetype: 'application/pdf',
});
```

#### Requesting Thumbnails

```typescript
const { data: thumbnailUrl } = useMatrixMedia(
  {
    url: 'mxc://matrix.org/image.jpg',
    type: MediaType.Image,
  },
  { isThumbnail: true }
);
```

### API

#### Parameters

##### media (Media | undefined)

The media object containing either:

- `url`: Direct URL to the media
- `file`: Encrypted file data
- `type`: Type of media (Image, Video, File, etc.)
- `name`: Name of the media file
- `mimetype`: MIME type of the media
- `width` and `height`: Dimensions (for images)

##### options (UseMatrixMediaOptions)

Optional configuration object:

- `isThumbnail`: Boolean indicating whether to request a thumbnail version

#### Return Value

```typescript
interface UseMatrixMediaResult {
  data: string | null; // The resolved media URL
  isPending: boolean; // Loading state
  isError: boolean; // Error state
  error: Error | null; // Error object if any
}
```

### Caching

The hook uses React Query for caching with the following configuration:

- Cache duration: 24 hours
- Automatic background refetching
- Deduplication of requests
- Error retry logic

### Error Handling

The hook provides comprehensive error handling:

- Automatic retries for failed requests
- Error state management
- Detailed error information
- Graceful fallbacks

### Best Practices

1. **Always Check Loading State**

```typescript
const { data, isPending } = useMatrixMedia(media);
if (isPending) return <LoadingSpinner />;
```

2. **Handle Errors Gracefully**

```typescript
const { data, isError, error } = useMatrixMedia(media);
if (isError) return <ErrorMessage error={error} />;
```

3. **Use TypeScript for Type Safety**

```typescript
const { data } = useMatrixMedia<MediaType.Image>(media);
```

4. **Consider Using Thumbnails for Large Images**

```typescript
const { data: thumbnailUrl } = useMatrixMedia(media, { isThumbnail: true });
```

### Performance Considerations

- The hook caches media URLs for 24 hours
- Duplicate requests are automatically deduplicated
- Background refetching ensures data freshness
- Memory usage is optimized through React Query's cache management

### Contributing

When contributing to this hook:

1. Add tests for new features
2. Update documentation
3. Consider performance implications
4. Follow TypeScript best practices
