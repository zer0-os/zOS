import { useEffect, useState } from 'react';
import AttachmentCards from '../../../platform-apps/channels/attachment-cards';
import { Media, MediaDownloadStatus, MediaType, MessageAttachment } from '../../../store/messages';
import { getPlaceholderDimensions } from '../utils';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Blurhash } from 'react-blurhash';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { useMatrixImage } from '../../../lib/hooks/useMatrixImage';
import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('message');

interface MessageMediaProps {
  media: Media;
  onImageClick: (media: Media) => void;
  openAttachmentPreview: (attachment: MessageAttachment) => void;
}

export const MessageMedia = ({ media, onImageClick, openAttachmentPreview }: MessageMediaProps) => {
  const { type, url, name, downloadStatus, mimetype, file } = media;
  console.log('XXXX MessageMedia render:', file?.url);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const blurhash = media['xyz.amorgan.blurhash'];
  const { width, height } = getPlaceholderDimensions(media.width, media.height);

  // For encrypted files, we need to use the file.url instead of the media.url
  const matrixUrl = file?.url || url;
  const isMatrixUrl = matrixUrl?.startsWith('mxc://');

  // Use the Matrix image hook for Matrix URLs
  const { data: processedUrl, isLoading: isMatrixImageLoading } = useMatrixImage(isMatrixUrl ? matrixUrl : undefined);

  // reset isImageLoaded when the URL changes
  useEffect(() => {
    setIsImageLoaded(false);
  }, [processedUrl]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const renderPlaceholderContent = (
    hasFailed: boolean,
    isLoading: boolean,
    blurhash: string,
    width: number,
    height: number
  ) => (
    <>
      {hasFailed ? (
        <IconAlertCircle size={32} {...cn('icon', 'failed')} />
      ) : blurhash ? (
        <Blurhash hash={blurhash} width={width} height={height} resolutionX={16} resolutionY={12} punch={1.5} />
      ) : (
        <div {...cn('placeholder-box')} />
      )}
      {isLoading && <Spinner {...cn('icon', 'loading')} />}
    </>
  );

  if ((!matrixUrl || isMatrixUrl) && !processedUrl) {
    const isLoading = downloadStatus === MediaDownloadStatus.Loading || isMatrixImageLoading;
    const hasFailed = downloadStatus === MediaDownloadStatus.Failed;

    return (
      <>
        {mimetype?.includes('application') || mimetype?.includes('audio') ? (
          <AttachmentCards attachments={[{ name, url: '', type: MediaType.Unknown }]} onAttachmentClicked={() => {}} />
        ) : (
          <div {...cn('placeholder-container')} style={{ width, height }}>
            <div {...cn('placeholder-content')}>
              {renderPlaceholderContent(hasFailed, isLoading, blurhash, width, height)}
            </div>
          </div>
        )}
      </>
    );
  }

  const displayUrl = processedUrl || matrixUrl;
  if (type === MediaType.Image) {
    return (
      <div {...cn('block-image')} onClick={() => onImageClick({ ...media, url: displayUrl })}>
        <img src={displayUrl} alt={name} onLoad={handleImageLoad} style={!isImageLoaded ? { width, height } : {}} />
      </div>
    );
  } else if (type === MediaType.Video) {
    return (
      <div {...cn('block-video')}>
        <video controls>
          <source src={url} />
        </video>
      </div>
    );
  } else if (type === MediaType.File) {
    const attachment = { url, name, type, mimetype };
    return (
      <div {...cn('attachment')} onClick={() => openAttachmentPreview(attachment)}>
        <AttachmentCards attachments={[attachment]} onAttachmentClicked={() => openAttachmentPreview(attachment)} />
      </div>
    );
  } else if (type === MediaType.Audio) {
    return (
      <div {...cn('block-audio')}>
        <audio controls controlsList='nodownload nofullscreen noplaybackrate'>
          <source src={url} type={mimetype} />
        </audio>
      </div>
    );
  }
  return null;
};
