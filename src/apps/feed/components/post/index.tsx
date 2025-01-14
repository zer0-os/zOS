import { useState, useCallback, useMemo } from 'react';
import moment from 'moment';
import { Name, Post as ZUIPost } from '@zero-tech/zui/components/Post';
import { Timestamp } from '@zero-tech/zui/components/Post/components/Timestamp';
import { Avatar } from '@zero-tech/zui/components';
import { MeowAction } from './actions/meow';
import { featureFlags } from '../../../../lib/feature-flags';
import { Media, MediaDownloadStatus, MediaType } from '../../../../store/messages';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { ReplyAction } from './actions/reply/reply-action';
import { formatWeiAmount } from '../../../../lib/number';

import classNames from 'classnames';
import styles from './styles.module.scss';

import { usePostRoute } from './lib/usePostRoute';
type Variant = 'default' | 'expanded';

export interface PostProps {
  className?: string;
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
  variant?: Variant;
  numberOfReplies?: number;

  loadAttachmentDetails: (payload: { media: Media; messageId: string }) => void;
  meowPost: (postId: string, meowAmount: string) => void;
}

export const Post = ({
  className,
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
  meowPost,
  variant = 'default',
  numberOfReplies = 0,
}: PostProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const isMeowsEnabled = featureFlags.enableMeows;
  const isDisabled =
    formatWeiAmount(userMeowBalance) <= '0' || ownerUserId?.toLowerCase() === currentUserId?.toLowerCase();

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
      const { type, url, name, width, height, downloadStatus } = media;
      const placeholderDimensions = getPlaceholderDimensions(width, height);
      const isMatrixUrl = url?.startsWith('mxc://');

      if (!url || isMatrixUrl) {
        if (downloadStatus !== MediaDownloadStatus.Failed) {
          loadAttachmentDetails({ media, messageId: media.id ?? messageId.toString() });
        }

        return (
          <div
            className={styles.ImagePlaceholderContainer}
            style={{ width: placeholderDimensions.width, height: placeholderDimensions.height }}
          >
            <div
              className={`${styles.ImagePlaceholder} ${
                downloadStatus === MediaDownloadStatus.Loading ? styles.Loading : styles.Failed
              }`}
            >
              {downloadStatus === MediaDownloadStatus.Failed && <IconAlertCircle size={32} />}
            </div>
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
    <Wrapper postId={messageId} variant={variant}>
      <div className={classNames(styles.Container, className)} has-author={author ? '' : null} data-variant={variant}>
        {variant === 'default' && (
          <div className={styles.Avatar}>
            <Avatar size='regular' imageURL={avatarUrl} />
          </div>
        )}
        <ZUIPost
          className={styles.Post}
          body={
            <div className={styles.Body}>
              {multilineText}
              {media && renderMedia(media)}
              {variant === 'expanded' && (
                <span className={styles.Date}>{moment(timestamp).format('h:mm A - D MMM YYYY')}</span>
              )}
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
          options={variant === 'default' && <Timestamp className={styles.Date} timestamp={timestamp} />}
          actions={
            isMeowsEnabled && (
              <Actions variant={variant}>
                <PreventPropagation>
                  <MeowAction
                    meows={reactions?.MEOW || 0}
                    isDisabled={isDisabled}
                    messageId={messageId}
                    meowPost={meowPost}
                    hasUserVoted={reactions?.VOTED > 0}
                  />
                </PreventPropagation>
                {featureFlags.enableComments && (
                  <PreventPropagation>
                    <ReplyAction postId={messageId} numberOfReplies={numberOfReplies} />
                  </PreventPropagation>
                )}
              </Actions>
            )
          }
        />
      </div>
    </Wrapper>
  );
};

export const Actions = ({ children, variant }: { children: React.ReactNode; variant: Variant }) => {
  return (
    <div className={styles.Actions} data-variant={variant}>
      {children}
    </div>
  );
};

const Wrapper = ({ children, postId, variant }: { children: React.ReactNode; postId: string; variant: Variant }) => {
  const { navigateToPost } = usePostRoute(postId);

  const handleOnClick = () => {
    if (variant === 'default') {
      navigateToPost();
    }
  };

  return (
    <div className={styles.Wrapper} data-variant={variant} onClick={handleOnClick} tabIndex={0} role='button'>
      {children}
    </div>
  );
};

const PreventPropagation = ({ children }: { children: React.ReactNode }) => {
  return <div onClick={(e) => e.stopPropagation()}>{children}</div>;
};
