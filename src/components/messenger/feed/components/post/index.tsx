import { useState, useCallback, useMemo } from 'react';
import { Name, Post as ZUIPost } from '@zero-tech/zui/components/Post';
import { Timestamp } from '@zero-tech/zui/components/Post/components/Timestamp';
import { Avatar } from '@zero-tech/zui/components';
import { MeowAction } from './actions/meow';
import { featureFlags } from '../../../../../lib/feature-flags';
import { Media, MediaType } from '../../../../../store/messages';

import styles from './styles.module.scss';
import { formatWeiAmount } from '../../../../../lib/number';

export interface PostProps {
  currentUserId?: string;
  messageId: string;
  avatarUrl?: string;
  timestamp: number;
  author?: string;
  nickname: string;
  text?: string;
  media?: any;
  ownerUserId?: string;
  userMeowBalance?: string;
  reactions?: { [key: string]: number };
  transferError?: string;

  loadAttachmentDetails: (payload: { media: Media; messageId: string }) => void;
  transferMeow: (postOwnerId, postMessageId, meowAmount) => void;
}

export const Post = ({
  currentUserId,
  messageId,
  avatarUrl,
  text,
  nickname,
  author,
  timestamp,
  media,
  ownerUserId,
  userMeowBalance,
  reactions,
  loadAttachmentDetails,
  transferMeow,
  transferError,
}: PostProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const isMeowsEnabled = featureFlags.enableMeows;
  const isDisabled = formatWeiAmount(userMeowBalance) <= '0' || ownerUserId === currentUserId;

  const multilineText = useMemo(
    () =>
      text?.split('\n').map((line, index) => (
        <p key={index} className={styles.Text}>
          {line}
        </p>
      )),
    [text]
  );

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
    handleMediaAspectRatio(width, height);
    setIsImageLoaded(true);
  }, []);

  const handleMediaAspectRatio = (width: number, height: number) => {
    const aspectRatio = width / height;
    setIsImageLoaded(height > 520 && aspectRatio <= 5 / 4);
  };

  const handlePlaceholderAspectRatio = (width: number, height: number, maxWidth: number, maxHeight: number) => {
    const aspectRatio = width / height;
    let finalWidth = width;
    let finalHeight = height;

    if (height > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = maxHeight * aspectRatio;
    }

    if (finalWidth > maxWidth) {
      finalWidth = maxWidth;
      finalHeight = maxWidth / aspectRatio;
    }

    return { width: finalWidth, height: finalHeight };
  };

  const getPlaceholderDimensions = useCallback((w: number, h: number) => {
    const maxWidth = 420;
    const maxHeight = 520;
    return handlePlaceholderAspectRatio(w, h, maxWidth, maxHeight);
  }, []);

  const renderMedia = useCallback(
    (media) => {
      const { type, url, name, width, height } = media;
      const placeholderDimensions = getPlaceholderDimensions(width, height);

      if (!url) {
        loadAttachmentDetails({ media, messageId: media.id ?? messageId.toString() });
        return (
          <div
            className={styles.ImagePlaceholderContainer}
            style={{ width: placeholderDimensions.width, height: placeholderDimensions.height }}
          >
            <div className={styles.ImagePlaceholder} />
          </div>
        );
      }

      if (MediaType.Image === type) {
        return (
          <div className={styles.BlockImage}>
            <img src={url} alt={name} onLoad={handleImageLoad} style={!isImageLoaded ? placeholderDimensions : {}} />
          </div>
        );
      }

      return null;
    },
    [
      isImageLoaded,
      loadAttachmentDetails,
      messageId,
      getPlaceholderDimensions,
      handleImageLoad,
    ]
  );

  return (
    <div className={styles.Container} has-author={author ? '' : null}>
      <div className={styles.Avatar}>
        <Avatar size='regular' imageURL={avatarUrl} />
      </div>
      <ZUIPost
        className={styles.Post}
        body={
          <div className={styles.Body}>
            {multilineText}
            {media && renderMedia(media)}
          </div>
        }
        details={
          <>
            {/* @ts-ignore */}
            <Name className={styles.Name} variant='name'>
              {nickname}
            </Name>
            {author && (
              <>
                {/* @ts-ignore */}
                <Name className={styles.UserName} variant='username'>
                  {author}
                </Name>
              </>
            )}
          </>
        }
        options={<Timestamp className={styles.Date} timestamp={timestamp} />}
        actions={
          isMeowsEnabled && (
            <MeowAction
              meows={reactions?.MEOW || 0}
              isDisabled={isDisabled}
              ownerUserId={ownerUserId}
              transferMeow={transferMeow}
              messageId={messageId}
              transferError={transferError}
            />
          )
        }
      />
    </div>
  );
};
