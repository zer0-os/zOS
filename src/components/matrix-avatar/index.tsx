/**
 * Unfortunately, the browser is not capable of caching images from Matrix, as a bearer
 * token is required to download images.
 *
 * This component is a workaround to cache the image in the browser.
 */

import { Avatar, AvatarProps } from '@zero-tech/zui/components/Avatar';
import { useMatrixImage } from '../../lib/hooks/useMatrixImage';
import { memo } from 'react';
import cx from 'classnames';
import styles from './matrix-avatar.module.css';

interface MatrixAvatarProps extends AvatarProps {
  imageURL?: string;
  className?: string;
}

export const MatrixAvatar = memo(({ imageURL, size = 'regular', className, ...rest }: MatrixAvatarProps) => {
  const { data: authenticatedUrl, isFetching } = useMatrixImage(imageURL, { isThumbnail: true });

  return (
    <Avatar
      size={size}
      imageURL={authenticatedUrl}
      className={cx({ [styles.hidden]: isFetching }, className)}
      {...rest}
    />
  );
});

MatrixAvatar.displayName = 'MatrixAvatar';
