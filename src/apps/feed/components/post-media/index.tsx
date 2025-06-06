import { useState } from 'react';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { getPlaceholderDimensions } from './utils';
import { usePostMedia } from '../../lib/usePostMedia';
import { useDispatch } from 'react-redux';
import { openLightbox } from '../../../../store/dialogs';
import { Media, MediaType } from '../../../../store/messages';

import styles from './styles.module.scss';

interface PostMediaProps {
  mediaId: string;
}

export const PostMedia = ({ mediaId }: PostMediaProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { mediaUrl: previewMediaUrl, mediaDetails, isLoading, error } = usePostMedia(mediaId, { isPreview: true });
  const { mediaUrl: fullResolutionMediaUrl, mediaDetails: fullResolutionMediaDetails } = usePostMedia(mediaId, {
    isPreview: false,
  });
  const dispatch = useDispatch();

  // Use fallback dimensions if mediaDetails is not yet available
  const { width, height } = mediaDetails
    ? getPlaceholderDimensions(mediaDetails.width, mediaDetails.height)
    : { width: 800, height: 600 };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewMediaUrl || !mediaDetails) return;

    if (!mediaDetails.mimeType?.startsWith('video/')) {
      const media: Media = {
        type: MediaType.Image,
        url: fullResolutionMediaUrl,
        name: 'Post media',
        width: fullResolutionMediaDetails.width,
        height: fullResolutionMediaDetails.height,
        mimetype: fullResolutionMediaDetails.mimeType,
      };
      dispatch(openLightbox({ media: [media], startingIndex: 0, hasActions: false }));
    }
  };

  const renderPlaceholderContent = () => (
    <>
      {error ? <IconAlertCircle size={32} className={styles.Failed} /> : <div className={styles.Placeholder} />}
      {isLoading && <Spinner className={styles.Loading} />}
    </>
  );

  if (!previewMediaUrl) {
    return (
      <div className={styles.PlaceholderContainer} style={{ width, height }}>
        <div className={styles.PlaceholderContent}>{renderPlaceholderContent()}</div>
      </div>
    );
  }

  const isVideo = mediaDetails?.mimeType?.startsWith('video/');

  return (
    <div className={styles.BlockImage} onClick={handleClick}>
      {isVideo ? (
        <video controls className={styles.Video}>
          <source src={previewMediaUrl} type={mediaDetails?.mimeType} />
        </video>
      ) : (
        <img
          src={previewMediaUrl}
          alt={'post media'}
          onLoad={handleImageLoad}
          style={!isImageLoaded ? { width, height } : {}}
        />
      )}
    </div>
  );
};
