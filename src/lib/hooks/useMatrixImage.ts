import { useQuery } from '@tanstack/react-query';
import { decryptFile, isFileUploadedToMatrix } from '../../lib/chat/matrix/media';
import { EncryptedFile } from 'matrix-js-sdk/lib/types';
import { MediaType } from '../../store/messages';
import { isEncryptedFile } from '../chat/matrix/types';
import { useRef } from 'react';

interface UseMatrixImageOptions {
  isThumbnail?: boolean;
}

export function useMatrixImage(fileOrUrl: EncryptedFile | string | undefined, options: UseMatrixImageOptions = {}) {
  const { isThumbnail = false } = options;
  const isFile = typeof fileOrUrl === 'object';
  const isEncrypted = isFile && isEncryptedFile(fileOrUrl);
  const file = isEncrypted ? fileOrUrl : { url: fileOrUrl };

  const blobUrlRef = useRef<string | undefined>();

  const result = useQuery({
    queryKey: ['matrix', 'file', { url: file.url, isThumbnail }],
    queryFn: async () => {
      if (!file.url) return;

      if (!isFileUploadedToMatrix(file.url)) {
        return file.url;
      }

      const imageUrl = await decryptFile(file, MediaType.Image, { isThumbnail });

      // store the blob URL in the ref
      blobUrlRef.current = imageUrl;
      return imageUrl;
    },
    enabled: !!file.url,
    staleTime: 1000 * 60 * 60 * 24,
    // Set garbage collection time to 0 to immediately remove query data from cache when
    // the component unmounts. This is critical for blob URLs to:
    // 1. Prevent memory leaks by ensuring revoked blob URLs aren't kept in React Query's cache
    // 2. Force a refetch when returning to this component rather than using a stale/revoked URL
    // 3. Work in conjunction with our cleanup effect that revokes the blob URL on unmount
    gcTime: 0,
  });

  return result;
}
