import { useMemo, useState, useCallback, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Name, Post as ZUIPost } from '@zero-tech/zui/components/Post';
import { Timestamp } from '@zero-tech/zui/components/Post/components/Timestamp';
import { MatrixAvatar } from '../../../../components/matrix-avatar';
import { MeowAction } from './actions/meow';
import { featureFlags } from '../../../../lib/feature-flags';
import { ReplyAction } from './actions/reply/reply-action';
import { formatWeiAmount } from '../../../../lib/number';
import { FeedAction } from './actions/feed';
import { ArweaveAction } from './actions/arweave';
import { ShowMoreButton } from '../show-more-button';
import { analyzePostContent } from '../../lib/analyzePostContent';
import { usePostRoute } from './lib/usePostRoute';
import Linkify from 'linkify-react';
import { PostLinkPreview } from './link-preview';
import { detectLinkType } from './link-preview/utils';
import { PostMedia } from '../post-media';
import { useGetReturnFromProfilePath } from '../../lib/useGetReturnFromProfilePath';
import { RETURN_POST_ID_KEY, RETURN_PATH_KEY } from '../../lib/useReturnFromProfileNavigation';
import { ProfileCardHover } from '../../../../components/profile-card/hover';
import classNames from 'classnames';
import styles from './styles.module.scss';

type Variant = 'default' | 'expanded';

export interface PostProps {
  arweaveId: string;
  className?: string;
  currentUserId?: string;
  messageId: string;
  avatarUrl?: string;
  timestamp: number;
  author?: string;
  nickname: string;
  text?: string;
  ownerUserId?: string;
  channelZid?: string;
  userMeowBalance?: string;
  reactions?: { [key: string]: number };
  variant?: Variant;
  numberOfReplies?: number;
  isSinglePostView?: boolean;
  authorPrimaryZid?: string;
  authorPublicAddress?: string;
  mediaId?: string;

  meowPost: (postId: string, meowAmount: string) => void;
}

export const Post = ({
  arweaveId,
  className,
  currentUserId,
  messageId,
  avatarUrl,
  text,
  nickname,
  author,
  timestamp,
  ownerUserId,
  channelZid,
  userMeowBalance,
  reactions,
  meowPost,
  variant = 'default',
  numberOfReplies = 0,
  isSinglePostView = false,
  authorPrimaryZid,
  authorPublicAddress,
  mediaId,
}: PostProps) => {
  const isMeowsEnabled = featureFlags.enableMeows;
  const isDisabled =
    formatWeiAmount(userMeowBalance) <= '0' || ownerUserId?.toLowerCase() === currentUserId?.toLowerCase();

  const [isExpanded, setIsExpanded] = useState(false);

  const { shouldTruncate, truncatedContent } = useMemo(() => analyzePostContent(text), [text]);

  const shouldShowTruncation = !isSinglePostView && shouldTruncate;

  const displayText = useMemo(() => {
    if (!text || !shouldShowTruncation || isExpanded) return text;
    return truncatedContent;
  }, [
    text,
    shouldShowTruncation,
    isExpanded,
    truncatedContent,
  ]);

  const multilineText = useMemo(
    () => (
      <div className={styles.TextContainer}>
        {displayText.split('\n').map((line, index) => {
          const linkType = detectLinkType(line);
          const hasPreview = linkType !== null;

          return (
            <div key={index} className={styles.TextLine}>
              <span className={styles.Text}>{line}</span>
              {hasPreview && <PostLinkPreview url={line} />}
            </div>
          );
        })}
      </div>
    ),
    [displayText]
  );

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  return (
    <Wrapper postId={messageId} variant={variant} channelZid={channelZid}>
      <div className={classNames(styles.Container, className)} has-author={author ? '' : null} data-variant={variant}>
        {variant === 'default' && (
          <div className={styles.Avatar}>
            <ProfileCardHover userId={authorPrimaryZid ?? authorPublicAddress}>
              <MatrixAvatar size='regular' imageURL={avatarUrl} />
            </ProfileCardHover>
          </div>
        )}
        <ZUIPost
          className={styles.Post}
          body={
            <div className={classNames(styles.Body, { [styles.Truncated]: shouldShowTruncation && !isExpanded })}>
              <Linkify options={{ render: renderLink }}>{multilineText}</Linkify>
              {shouldShowTruncation && !isExpanded && <ShowMoreButton onClick={handleExpand} />}
              {variant === 'expanded' && (
                <span className={styles.Date}>{moment(timestamp).format('h:mm A - D MMM YYYY')}</span>
              )}
              {featureFlags.enablePostMedia && mediaId && <PostMedia mediaId={mediaId} />}
            </div>
          }
          details={
            <div className={styles.Details}>
              {variant === 'expanded' && (
                <div className={styles.Avatar}>
                  <ProfileLink primaryZid={authorPrimaryZid} publicAddress={authorPublicAddress} postId={messageId}>
                    <ProfileCardHover userId={authorPrimaryZid ?? authorPublicAddress}>
                      <MatrixAvatar size='regular' imageURL={avatarUrl} />
                    </ProfileCardHover>
                  </ProfileLink>
                </div>
              )}
              <div className={styles.Wrapper}>
                {/* @ts-ignore */}
                <Name className={styles.Name} variant='name'>
                  <ProfileLink primaryZid={authorPrimaryZid} publicAddress={authorPublicAddress} postId={messageId}>
                    {nickname}
                  </ProfileLink>
                  <span>⋅</span>
                  {variant === 'default' && <Timestamp className={styles.Date} timestamp={timestamp} />}
                </Name>
                {author && (
                  <>
                    {/* @ts-ignore */}
                    <Name className={styles.UserName} variant='username'>
                      {author}
                    </Name>
                  </>
                )}
              </div>
            </div>
          }
          actions={
            isMeowsEnabled && (
              <Actions variant={variant}>
                <div>
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
                </div>
                <div>
                  {channelZid && (
                    <PreventPropagation>
                      <FeedAction channelZid={channelZid} />
                    </PreventPropagation>
                  )}
                  <PreventPropagation>
                    <ArweaveAction arweaveId={arweaveId} />
                  </PreventPropagation>
                </div>
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

interface WrapperProps {
  channelZid?: string;
  children: React.ReactNode;
  postId: string;
  variant: Variant;
}

const Wrapper = ({ children, postId, variant, channelZid }: WrapperProps) => {
  const { navigateToPost } = usePostRoute(postId, channelZid);

  const handleOnClick = () => {
    if (variant === 'default') {
      navigateToPost();
    }
  };

  return (
    <div
      className={styles.Wrapper}
      data-variant={variant}
      data-post-id={postId}
      onClick={handleOnClick}
      tabIndex={0}
      role='button'
    >
      {children}
    </div>
  );
};
const PreventPropagation = ({ children }: { children: React.ReactNode }) => {
  return <div onClick={(e) => e.stopPropagation()}>{children}</div>;
};

const renderLink = ({ attributes, content }) => {
  const { href, ...props } = attributes;
  return (
    <a
      onClick={(e) => e.stopPropagation()}
      className={styles.Link}
      href={href}
      target='_blank'
      rel='noreferrer'
      {...props}
    >
      {content}
    </a>
  );
};

const ProfileLink = ({
  primaryZid,
  publicAddress,
  children,
  postId,
}: {
  primaryZid: string;
  publicAddress: string;
  children: ReactNode;
  postId: string;
}) => {
  const { returnPath } = useGetReturnFromProfilePath();

  const searchParams = new URLSearchParams();
  searchParams.set(RETURN_POST_ID_KEY, postId);
  searchParams.set(RETURN_PATH_KEY, returnPath);

  return (
    <PreventPropagation>
      <Link to={`/profile/${primaryZid ?? publicAddress}?${searchParams.toString()}`}>{children}</Link>
    </PreventPropagation>
  );
};
