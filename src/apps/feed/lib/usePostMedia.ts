import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMediaDetails } from '../../../store/posts/media-api';

const URL_REFRESH_INTERVAL = 45 * 1000; // 45 seconds (before 60-second expiration)
const STALE_TIME = 1000 * 60 * 60;

export function usePostMedia(mediaId?: string) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['media', mediaId],
    queryFn: () => (mediaId ? getMediaDetails(mediaId) : null),
    enabled: !!mediaId,
    refetchInterval: refreshInterval ?? false,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (data?.signedUrl) {
      setCurrentUrl(data.signedUrl);
      // Set up refresh interval only if we don't have cached data
      if (!data.media) {
        const interval = setInterval(() => {
          setRefreshInterval(URL_REFRESH_INTERVAL);
        }, URL_REFRESH_INTERVAL);
        return () => clearInterval(interval);
      }
    }
  }, [data?.signedUrl, data?.media]);

  return {
    mediaUrl: currentUrl,
    mediaDetails: data?.media,
    isLoading,
    error,
  };
}
