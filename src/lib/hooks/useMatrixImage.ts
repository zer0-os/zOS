import { useQuery } from '@tanstack/react-query';
import { decryptFile, isFileUploadedToMatrix } from '../../lib/chat/matrix/media';
import { EncryptedFile } from 'matrix-js-sdk/lib/types';
import { MediaType } from '../../store/messages';
import { isEncryptedFile } from '../chat/matrix/types';

interface UseMatrixImageOptions {
  isThumbnail?: boolean;
}

export function useMatrixImage(fileOrUrl: EncryptedFile | string | undefined, options: UseMatrixImageOptions = {}) {
  const { isThumbnail = false } = options;
  const isFile = typeof fileOrUrl === 'object';
  const isEncrypted = isFile && isEncryptedFile(fileOrUrl);
  const file = isEncrypted ? fileOrUrl : { url: fileOrUrl };

  return useQuery({
    queryKey: ['matrix', 'file', { url: file.url, isThumbnail }],
    queryFn: async () => {
      if (!file.url) return;

      if (!isFileUploadedToMatrix(file.url)) {
        return file.url;
      }

      return decryptFile(file, MediaType.Image, { isThumbnail });
    },
    enabled: !!file.url,
    staleTime: 1000 * 60 * 60 * 24,
  });
}
