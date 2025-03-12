import React, { useMemo } from 'react';
import { Status } from './status';
import { IconCurrencyEthereum, IconUsers1 } from '@zero-tech/zui/icons';

import { AVATAR_ICON_SIZE } from './constants';

import classNames from 'classnames';
import styles from './styles.module.scss';

export interface AvatarProps {
  imageURL?: string;
  size: 'extra small' | 'small' | 'regular' | 'medium';
  badgeContent?: string;
  statusType?: 'active' | 'idle' | 'busy' | 'offline' | 'unread';
  isActive?: boolean;
  isRaised?: boolean;
  tabIndex?: number;
  isGroup?: boolean;
}

export const AvatarBadge = React.memo(({ badgeContent }: { badgeContent: AvatarProps['badgeContent'] }) => {
  return <div className={styles.Badge}>{badgeContent}</div>;
});

AvatarBadge.displayName = 'AvatarBadge';

export const Avatar = React.memo(
  ({
    size = 'regular',
    imageURL,
    statusType,
    badgeContent,
    isActive,
    isRaised,
    tabIndex = 0,
    isGroup = false,
  }: AvatarProps) => {
    // Memoize the icon rendering function
    const defaultIcon = useMemo(() => {
      if (isGroup) {
        return <IconUsers1 size={AVATAR_ICON_SIZE[size]} />;
      } else {
        return <IconCurrencyEthereum size={AVATAR_ICON_SIZE[size]} />;
      }
    }, [isGroup, size]);

    // Memoize class names calculation
    const avatarClassNames = useMemo(
      () =>
        classNames(styles.Avatar, {
          [styles.isActive]: isActive,
          [styles.isRaised]: isRaised,
        }),
      [isActive, isRaised]
    );

    const defaultIconClassNames = useMemo(
      () =>
        classNames(styles.DefaultIcon, {
          [styles.isGroup]: isGroup,
        }),
      [isGroup]
    );

    const showStatusOrBadge = size !== 'extra small';

    // State to track if image has loaded or failed
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    // Handle image load and error events
    const handleImageLoad = () => setImageLoaded(true);
    const handleImageError = () => setImageError(true);

    // Determine if we should show the fallback
    const showFallback = !imageURL || imageError || !imageLoaded;

    return (
      <div className={avatarClassNames} data-size={size} tabIndex={tabIndex}>
        <div className={styles.Root}>
          {imageURL && !imageError && (
            <img
              className={styles.Image}
              src={imageURL}
              alt='avatar'
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          )}

          {showFallback && (
            <div className={styles.Fallback}>
              <div className={defaultIconClassNames}>{defaultIcon}</div>
            </div>
          )}
        </div>
        {showStatusOrBadge && statusType && <Status className={styles.Status} type={statusType} />}
        {showStatusOrBadge && badgeContent && <AvatarBadge badgeContent={badgeContent} />}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
