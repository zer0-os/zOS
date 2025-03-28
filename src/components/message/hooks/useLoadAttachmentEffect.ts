import { useEffect } from 'react';
import { MessagesFetchState } from '../../../store/channels';
import { Media, MediaDownloadStatus } from '../../../store/messages';

export const useLoadAttachmentEffect = (
  media: Media,
  messageId: string,
  loadAttachmentDetails: (payload: { media: any; messageId: string }) => void,
  messagesFetchStatus: MessagesFetchState
) => {
  useEffect(() => {
    const isImage = media?.mimetype?.startsWith('image/');
    const isEncrypted = !!media?.file;
    const isMatrixUrl = media?.url?.startsWith('mxc://') || media?.file?.url?.startsWith('mxc://');
    const isBlobUrl = media?.url?.startsWith('blob:');

    const isLoading = media?.downloadStatus === MediaDownloadStatus.Loading;
    const hasFailed = media?.downloadStatus === MediaDownloadStatus.Failed;

    // We need to load attachment details for:
    // 1. Non-image files with Matrix URLs
    // 2. Encrypted image files that don't have a blob URL yet
    // 3. Encrypted non-image files
    if (
      media &&
      ((!isImage && isMatrixUrl) || (isEncrypted && isImage && !isBlobUrl)) &&
      !isLoading &&
      !hasFailed &&
      messagesFetchStatus === MessagesFetchState.SUCCESS
    ) {
      console.log('Loading attachment details for:', { messageId, isImage, isEncrypted, isMatrixUrl, isBlobUrl });
      loadAttachmentDetails({ media, messageId });
    }

    // `media` is re-rendering constantly - excluding until we figure out why
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    messagesFetchStatus,
    messageId,
    loadAttachmentDetails,
    media?.downloadStatus,
    media?.url,
  ]);
};
