import { useState } from 'react';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { getPlaceholderDimensions } from './utils';
import { PostMedia as PostMediaType } from './types';
import { useDispatch } from 'react-redux';
import { openLightbox } from '../../../../store/dialogs';

import styles from './styles.module.scss';

interface PostMediaProps {
  media: PostMediaType;
}

export const PostMedia = ({ media }: PostMediaProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { width, height } = getPlaceholderDimensions(media.width, media.height);
  const dispatch = useDispatch();

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(openLightbox({ media: [media], startingIndex: 0, hasActions: false }));
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

  return (
    <div className={styles.BlockImage} onClick={handleClick}>
      <img src={media.url} alt={media.name} onLoad={handleImageLoad} style={!isImageLoaded ? { width, height } : {}} />
    </div>
  );
};
