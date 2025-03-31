import { useEffect } from 'react';
import { MessagesFetchState } from '../../../store/channels';
import { Media, MediaDownloadStatus, MediaType } from '../../../store/messages';

export const useLoadAttachmentEffect = (
  media: Media,
  messageId: string,
  loadAttachmentDetails: (payload: { media: any; messageId: string }) => void,
  messagesFetchStatus: MessagesFetchState
) => {
  useEffect(() => {
    const isImage = media?.type === MediaType.Image;
    const isLoading = media?.downloadStatus === MediaDownloadStatus.Loading;
    const hasFailed = media?.downloadStatus === MediaDownloadStatus.Failed;
    if (
      media &&
      !isImage &&
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
