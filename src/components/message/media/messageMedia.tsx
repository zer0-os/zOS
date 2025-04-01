import { useState } from 'react';
import AttachmentCards from '../../../platform-apps/channels/attachment-cards';
import { Media, MediaType, MessageAttachment } from '../../../store/messages';
import { getPlaceholderDimensions } from '../utils';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Blurhash } from 'react-blurhash';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('message');

interface MessageMediaProps {
  media: Media;
  effectiveMediaUrl: string;
  isLoading: boolean;
  isError: boolean;
  onImageClick: (media: Media) => void;
  openAttachmentPreview: (attachment: MessageAttachment) => void;
}

export const MessageMedia = ({
  media,
  effectiveMediaUrl,
  isLoading,
  isError,
  onImageClick,
  openAttachmentPreview,
}: MessageMediaProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const blurhash = media['xyz.amorgan.blurhash'];
  const { width, height } = getPlaceholderDimensions(media.width, media.height);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const renderPlaceholderContent = () => (
    <>
      {isError ? (
        <IconAlertCircle size={32} {...cn('icon', 'failed')} />
      ) : blurhash ? (
        <Blurhash hash={blurhash} width={width} height={height} resolutionX={16} resolutionY={12} punch={1.5} />
      ) : (
        <div {...cn('placeholder-box')} />
      )}
      {isLoading && <Spinner {...cn('icon', 'loading')} />}
    </>
  );

  if (!effectiveMediaUrl) {
    return (
      <>
        {media?.mimetype?.includes('application') || media?.mimetype?.includes('audio') ? (
          <AttachmentCards
            attachments={[{ name: media?.name, url: '', type: MediaType.Unknown }]}
            onAttachmentClicked={() => {}}
          />
        ) : (
          <div {...cn('placeholder-container')} style={{ width, height }}>
            <div {...cn('placeholder-content')}>{renderPlaceholderContent()}</div>
          </div>
        )}
      </>
    );
  }

  if (media?.type === MediaType.Image) {
    return (
      <div {...cn('block-image')} onClick={() => onImageClick(media)}>
        <img
          src={effectiveMediaUrl}
          alt={media?.name}
          onLoad={handleImageLoad}
          style={!isImageLoaded ? { width, height } : {}}
        />
      </div>
    );
  } else if (media?.type === MediaType.Video) {
    return (
      <div {...cn('block-video')}>
        <video controls>
          <source src={effectiveMediaUrl} />
        </video>
      </div>
    );
  } else if (media?.type === MediaType.File) {
    const attachment = { url: effectiveMediaUrl, name: media?.name, type: media?.type, mimetype: media?.mimetype };
    return (
      <div {...cn('attachment')} onClick={() => openAttachmentPreview(attachment)}>
        <AttachmentCards attachments={[attachment]} onAttachmentClicked={() => openAttachmentPreview(attachment)} />
      </div>
    );
  } else if (media?.type === MediaType.Audio) {
    return (
      <div {...cn('block-audio')}>
        <audio controls controlsList='nodownload nofullscreen noplaybackrate'>
          <source src={effectiveMediaUrl} type={media?.mimetype} />
        </audio>
      </div>
    );
  }
  return null;
};
