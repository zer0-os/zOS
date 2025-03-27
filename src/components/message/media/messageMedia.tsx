import { useState, useEffect } from 'react';
import AttachmentCards from '../../../platform-apps/channels/attachment-cards';
import { Media, MediaDownloadStatus, MediaType, MessageAttachment } from '../../../store/messages';
import { getPlaceholderDimensions } from '../utils';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Blurhash } from 'react-blurhash';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { bemClassName } from '../../../lib/bem';
import { useBlobUrlMemoryManagement } from '../../../lib/hooks/useBlobMemoryManagement';

const cn = bemClassName('message');

interface MessageMediaProps {
  media: Media;
  onImageClick: (media: Media) => void;
  openAttachmentPreview: (attachment: MessageAttachment) => void;
}

export const MessageMedia = ({ media, onImageClick, openAttachmentPreview }: MessageMediaProps) => {
  const { type, url, name, downloadStatus, mimetype } = media;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const blurhash = media['xyz.amorgan.blurhash'];
  const { width, height } = getPlaceholderDimensions(media.width, media.height);

  // Use the memory management hook for the media URL
  const {
    elementRef,
    displayUrl,
    isLoading: isUrlLoading,
    isInView,
    isUrlRevoked,
  } = useBlobUrlMemoryManagement(url, {
    rootMargin: '50px',
    threshold: 0.1,
    isThumbnail: false,
  });

  useEffect(() => {
    console.log(`xxxx INVIEW: ${isInView} for ${displayUrl?.substring(0, 30)}...`);

    if (!isInView) {
      console.log('XXXXXXXX Setting isImageLoaded to false');
      setIsImageLoaded(false);
    }
  }, [isInView, displayUrl]);

  const handleImageLoad = () => {
    console.log(`xxxx IMAGE LOADED loaded: ${displayUrl?.substring(0, 30)}...`);
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

  if (!displayUrl) {
    const isLoading = downloadStatus === MediaDownloadStatus.Loading || isUrlLoading;
    const hasFailed = downloadStatus === MediaDownloadStatus.Failed;

    return (
      <div ref={elementRef}>
        {mimetype?.includes('application') || mimetype?.includes('audio') ? (
          <AttachmentCards attachments={[{ name, url: '', type: MediaType.Unknown }]} onAttachmentClicked={() => {}} />
        ) : (
          <div {...cn('placeholder-container')} style={{ width, height }}>
            <div {...cn('placeholder-content')}>
              {renderPlaceholderContent(hasFailed, isLoading, blurhash, width, height)}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === MediaType.Image) {
    console.log('XXXX BLUR', blurhash);
    console.log(`xxxx is THIS IN OR NOW INVIEW: ${isInView}`);
    return (
      <div ref={elementRef} {...cn('block-image')} onClick={() => onImageClick({ ...media, url: displayUrl })}>
        {isInView && !isUrlRevoked && (
          <img src={displayUrl} alt={name} onLoad={handleImageLoad} style={!isImageLoaded ? { width, height } : {}} />
        )}
        {!isInView && blurhash && (
          <>
            {console.log(`xxxx YYYYY `)}
            <Blurhash hash={blurhash} width={width} height={height} resolutionX={16} resolutionY={12} punch={1.5} />
          </>
        )}
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
