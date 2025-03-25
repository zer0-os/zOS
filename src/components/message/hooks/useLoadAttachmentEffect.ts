import { useEffect } from 'react';
import { MessagesFetchState } from '../../../store/channels';
import { MediaDownloadStatus } from '../../../store/messages';

export const useLoadAttachmentEffect = (
  media: any,
  messageId: string,
  loadAttachmentDetails: (payload: { media: any; messageId: string }) => void,
  messagesFetchStatus: MessagesFetchState
) => {
  useEffect(() => {
    const isLoading = media?.downloadStatus === MediaDownloadStatus.Loading;
    const hasFailed = media?.downloadStatus === MediaDownloadStatus.Failed;
    if (
      media &&
      (!media.url || media.url.startsWith('mxc://')) &&
      !isLoading &&
      !hasFailed &&
      messagesFetchStatus === MessagesFetchState.SUCCESS
    ) {
      loadAttachmentDetails({ media, messageId });
    }
    // `media` is re-rendering constantly - excluding until we figure out why
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    messagesFetchStatus,
    messageId,
    loadAttachmentDetails,
    media?.downloadStatus,
  ]);
};
