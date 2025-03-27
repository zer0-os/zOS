import { useQuery } from '@tanstack/react-query';
import { chat } from '../../lib/chat';
import { isFileUploadedToMatrix } from '../../lib/chat/matrix/media';

interface UseMatrixImageOptions {
  isThumbnail?: boolean;
}

export function useMatrixImage(url: string | undefined, options: UseMatrixImageOptions = {}) {
  const { isThumbnail = false } = options;

  return useQuery({
    queryKey: ['matrix', 'file', { url, isThumbnail }],
    queryFn: async () => {
      if (!url) {
        return url;
      }

      const matrixClient = chat.get().matrix;

      if (!isFileUploadedToMatrix(url)) {
        return url;
      }

      return matrixClient.downloadFile(url, isThumbnail);
    },
    enabled: !!url,
    staleTime: 1000 * 60 * 60 * 24,
  });
}
