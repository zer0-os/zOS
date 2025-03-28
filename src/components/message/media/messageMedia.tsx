import { useState } from 'react';
import AttachmentCards from '../../../platform-apps/channels/attachment-cards';
import { Media, MediaDownloadStatus, MediaType, MessageAttachment } from '../../../store/messages';
import { getPlaceholderDimensions } from '../utils';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Blurhash } from 'react-blurhash';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { bemClassName } from '../../../lib/bem';
import { useMatrixImage } from '../../../lib/hooks/useMatrixImage';

const cn = bemClassName('message');

interface MessageMediaProps {
  media: Media;
  onImageClick: (media: Media) => void;
  openAttachmentPreview: (attachment: MessageAttachment) => void;
}

export const MessageMedia = ({ media, onImageClick, openAttachmentPreview }: MessageMediaProps) => {
  const { type, url, name, downloadStatus, mimetype, file } = media;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const blurhash = media['xyz.amorgan.blurhash'];
  const { width, height } = getPlaceholderDimensions(media.width, media.height);

  const mediaUrl = file?.url || url;
  const { data: imageUrl, isPending: isImageLoading } = useMatrixImage(file || mediaUrl);
  const displayImageUrl = imageUrl || mediaUrl;

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

  if (!mediaUrl && !imageUrl) {
    const isLoading = downloadStatus === MediaDownloadStatus.Loading || isImageLoading;
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

  if (type === MediaType.Image) {
    return (
      <div {...cn('block-image')} onClick={() => onImageClick({ ...media, url: displayImageUrl })}>
        <img
          src={displayImageUrl}
          alt={name}
          onLoad={handleImageLoad}
          style={!isImageLoaded ? { width, height } : {}}
        />
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
