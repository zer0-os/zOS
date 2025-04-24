import { useState } from 'react';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { getPlaceholderDimensions } from './utils';
import { PostMedia as PostMediaType, PostMediaType as MediaType } from './types';

import styles from './styles.module.scss';

interface PostMediaProps {
  media: PostMediaType;
  onImageClick?: (media: PostMediaType) => void;
}

export const PostMedia = ({ media, onImageClick }: PostMediaProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { width, height } = getPlaceholderDimensions(media.width, media.height);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const renderPlaceholderContent = () => (
    <>
      {media.filecoinStatus === 'failed' ? (
        <IconAlertCircle size={32} className={styles.Failed} />
      ) : (
        <div className={styles.Placeholder} />
      )}
      {media.filecoinStatus === 'pending' && <Spinner className={styles.Loading} />}
    </>
  );

  if (!media.url) {
    return (
      <div className={styles.PlaceholderContainer} style={{ width, height }}>
        <div className={styles.PlaceholderContent}>{renderPlaceholderContent()}</div>
      </div>
    );
  }

  if (media.type === MediaType.Image) {
    return (
      <div className={styles.BlockImage} onClick={() => onImageClick?.(media)}>
        <img
          src={media.url}
          alt={media.name}
          onLoad={handleImageLoad}
          style={!isImageLoaded ? { width, height } : {}}
        />
      </div>
    );
  } else if (media.type === MediaType.Video) {
    return (
      <div className={styles.BlockVideo}>
        <video controls>
          <source src={media.url} />
        </video>
      </div>
    );
  }

  return null;
};
