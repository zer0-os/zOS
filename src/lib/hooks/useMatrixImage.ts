import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { chat } from '../../lib/chat';
import { isFileUploadedToMatrix } from '../../lib/chat/matrix/media';

interface UseMatrixImageOptions {
  isThumbnail?: boolean;
}

export function useMatrixImage(url: string | undefined, options: UseMatrixImageOptions = {}) {
  const { isThumbnail = false } = options;
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshImage = () => {
    console.log(`xxxx [Matrix Image] Forcing refresh for ${url?.substring(0, 30)}...`);
    setRefreshCounter((prev) => prev + 1);
  };

  const result = useQuery({
    queryKey: ['matrix', 'file', { url, isThumbnail, refreshCounter }],
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

  return {
    ...result,
    refreshImage,
  };
}
