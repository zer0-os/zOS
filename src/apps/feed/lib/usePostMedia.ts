import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMediaDetails } from '../../../store/posts/media-api';

const URL_REFRESH_INTERVAL = 45 * 1000; // 45 seconds (before 60-second expiration)

export function usePostMedia(mediaId?: string) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['media', mediaId],
    queryFn: () => (mediaId ? getMediaDetails(mediaId) : null),
    enabled: !!mediaId,
    refetchInterval: refreshInterval ?? false,
  });

  useEffect(() => {
    if (data?.signedUrl) {
      setCurrentUrl(data.signedUrl);
      // Set up refresh interval
      const interval = setInterval(() => {
        setRefreshInterval(URL_REFRESH_INTERVAL);
      }, URL_REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [data?.signedUrl]);

  return {
    mediaUrl: currentUrl,
    mediaDetails: data?.media,
    isLoading,
    error,
  };
}
