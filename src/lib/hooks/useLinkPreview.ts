import { useQuery } from '@tanstack/react-query';
import { getLinkPreviews } from '../../store/messages/api';
import { getFirstUrl } from '../../store/messages/utils';

interface UseLinkPreviewOptions {
  enabled?: boolean;
}

export function useLinkPreview(message: string | undefined, options: UseLinkPreviewOptions = {}) {
  const { enabled = true } = options;
  const firstUrl = message ? getFirstUrl(message) : undefined;

  return useQuery({
    queryKey: ['linkPreview', firstUrl],
    queryFn: async () => {
      if (!firstUrl) return null;
      const result = await getLinkPreviews(firstUrl);
      return result.success ? result.body : null;
    },
    enabled: enabled && !!firstUrl,
  });
}
