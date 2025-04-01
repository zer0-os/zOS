import { useQuery } from '@tanstack/react-query';
import { chat } from '../../lib/chat';
import { isFileUploadedToMatrix, decryptFile } from '../../lib/chat/matrix/media';
import { Media } from '../../store/messages';

interface UseMatrixMediaOptions {
  isThumbnail?: boolean;
}

interface UseMatrixMediaResult {
  data: string | null;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * A React hook for handling Matrix media (images, videos, files) with support for both encrypted and non-encrypted content.
 * Uses React Query for efficient caching and state management.
 *
 * @param media - The media object containing either a direct URL or encrypted file data
 * @param options - Optional configuration for media handling
 * @param options.isThumbnail - Whether to request a thumbnail version of the media
 *
 * @returns An object containing:
 * - data: The resolved media URL (string | null)
 * - isPending: Loading state indicator
 * - isError: Error state indicator
 * - error: Error object if any
 */

export function useMatrixMedia(media: Media | undefined, options: UseMatrixMediaOptions = {}): UseMatrixMediaResult {
  const { isThumbnail = false } = options;

  return useQuery({
    queryKey: [
      'matrix',
      'media',
      {
        url: media?.url || media?.file?.url,
        type: media?.type,
        isThumbnail,
        isEncrypted: !!media?.file,
      },
    ],
    queryFn: async () => {
      if (!media) {
        return null;
      }

      const matrixClient = chat.get().matrix;

      // For encrypted files
      if (media.file) {
        try {
          return await decryptFile(media.file, media.mimetype);
        } catch (error) {
          console.error('Failed to decrypt file:', error);
          throw error;
        }
      }

      // For non-encrypted files
      if (media.url && isFileUploadedToMatrix(media.url)) {
        return matrixClient.downloadFile(media.url, isThumbnail);
      }

      // If it's not a Matrix URL, return the original URL
      return media.url || null;
    },
    enabled: !!media && (!!media.url || !!media.file),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
