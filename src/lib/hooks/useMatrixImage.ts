import { useQuery } from '@tanstack/react-query';
import { chat } from '../../lib/chat';
import { isFileUploadedToMatrix } from '../../lib/chat/matrix/media';
import { useEffect, useRef } from 'react';

interface UseMatrixImageOptions {
  isThumbnail?: boolean;
}

export function useMatrixImage(url: string | undefined, options: UseMatrixImageOptions = {}) {
  const { isThumbnail = false } = options;

  // ref to store the blob URL
  const blobUrlRef = useRef<string | undefined>();

  const result = useQuery({
    queryKey: ['matrix', 'file', { url, isThumbnail }],
    queryFn: async () => {
      if (!url) {
        return undefined;
      }

      const matrixClient = chat.get().matrix;

      if (!isFileUploadedToMatrix(url)) {
        return url;
      }

      const downloadedUrl = await matrixClient.downloadFile(url, isThumbnail);

      // store the blob URL in the ref
      blobUrlRef.current = downloadedUrl;
      return downloadedUrl;
    },
    enabled: !!url,
    staleTime: 1000 * 60 * 60 * 24,

    // Set garbage collection time to 0 to immediately remove query data from cache when
    // the component unmounts. This is critical for blob URLs to:
    // 1. Prevent memory leaks by ensuring revoked blob URLs aren't kept in React Query's cache
    // 2. Force a refetch when returning to this component rather than using a stale/revoked URL
    // 3. Work in conjunction with our cleanup effect that revokes the blob URL on unmount
    gcTime: 0,
  });

  // revoke the blob URL when the component unmounts for memory management
  useEffect(() => {
    return () => {
      const blobUrl = blobUrlRef.current;
      if (blobUrl && typeof blobUrl === 'string' && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
        blobUrlRef.current = undefined;
      }
    };
  }, [url]);

  return result;
}
