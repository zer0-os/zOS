/**
 * Unfortunately, the browser is not capable of caching images from Matrix, as a bearer
 * token is required to download images.
 *
 * This component is a workaround to cache the image in the browser.
 */

import { Avatar, AvatarProps } from '@zero-tech/zui/components/Avatar';
import { useMatrixImage } from '../../lib/hooks/useMatrixImage';

interface MatrixAvatarProps extends AvatarProps {
  imageURL?: string;
}

export const MatrixAvatar = ({ imageURL, size = 'regular' }: MatrixAvatarProps) => {
  const { data: authenticatedUrl } = useMatrixImage(imageURL, { isThumbnail: true });

  return <Avatar size={size} imageURL={authenticatedUrl} />;
};
