import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMediaDetails } from '../../../store/posts/media-api';

const URL_REFRESH_INTERVAL = 45 * 1000; // 45 seconds (before 60-second expiration)
const STALE_TIME = 30 * 1000; // 30 seconds - half of URL expiration time
const GC_TIME = 60 * 1000; // 1 minute - same as URL expiration

export function usePostMedia(mediaId?: string, { isPreview = false }: { isPreview?: boolean } = {}) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['media', { mediaId, isPreview }],
    queryFn: () => (mediaId ? getMediaDetails(mediaId, { isPreview }) : null),
    enabled: !!mediaId,
    refetchInterval: URL_REFRESH_INTERVAL,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (data?.signedUrl) {
      setCurrentUrl(data.signedUrl);
    }
  }, [data?.signedUrl]);

  return {
    mediaUrl: currentUrl,
    mediaDetails: data?.media,
    isLoading,
    error,
  };
}
