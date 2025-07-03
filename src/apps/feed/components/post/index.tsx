import { ReactNode } from 'react';
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
import { usePostRoute } from './lib/usePostRoute';
import { PostMedia } from '../post-media';
import { useGetReturnFromProfilePath } from '../../lib/useGetReturnFromProfilePath';
import { RETURN_POST_ID_KEY, RETURN_PATH_KEY } from '../../lib/useReturnFromProfileNavigation';
import { ProfileCardHover } from '../../../../components/profile-card/hover';
import classNames from 'classnames';
import { IconZeroProVerified } from '@zero-tech/zui/icons';
import { StatusAction } from './actions/status';
import { useSelector } from 'react-redux';
import { isOptimisticPostSelector } from '../../../../store/post-queue/selectors';
import { Content } from './content';
import { Container as QuoteContainer, Details as QuoteDetails } from './quote';
import { QuotedPost } from '../feed/lib/types';
import styles from './styles.module.scss';
import { QuoteAction } from './actions/quote';

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
  isZeroProSubscriber?: boolean;
  isPending?: boolean;
  isFailed?: boolean;
  meowPost: (postId: string, meowAmount: string) => void;
  error?: string;
  isReply?: boolean;
  quotedPost?: QuotedPost;
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
  isZeroProSubscriber,
  isPending,
  isFailed,
  isReply,
  error,
  quotedPost,
}: PostProps) => {
  const isMeowsEnabled = featureFlags.enableMeows;
  const isDisabled =
    formatWeiAmount(userMeowBalance) <= '0' || ownerUserId?.toLowerCase() === currentUserId?.toLowerCase();

  return (
    <Wrapper postId={messageId} variant={variant} channelZid={channelZid}>
      <div
        className={classNames(styles.Container, className)}
        has-author={author ? '' : null}
        data-variant={variant}
        data-disabled={isPending || isFailed ? '' : null}
      >
        {isReply && <div className={styles.ReplyIndicator} />}
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
            <div className={classNames(styles.Body)}>
              <Content text={text} isSinglePostView={isSinglePostView} />
              {featureFlags.enablePostMedia && mediaId && <PostMedia mediaId={mediaId} />}
              {quotedPost && (
                <PreventPropagation>
                  <Wrapper postId={quotedPost.id} variant='default'>
                    <QuoteContainer className={styles.Quote}>
                      <QuoteDetails
                        avatarURL={quotedPost.userProfileView.profileImage}
                        name={quotedPost.userProfileView.firstName}
                        timestamp={new Date(quotedPost.createdAt).getTime()}
                        isZeroProSubscriber={quotedPost.userProfileView.isZeroProSubscriber}
                      />
                      <Content text={quotedPost.text} isSinglePostView={false} />
                      {quotedPost.mediaId && <PostMedia mediaId={quotedPost.mediaId} />}
                    </QuoteContainer>
                  </Wrapper>
                </PreventPropagation>
              )}
              {variant === 'expanded' && (
                <span className={styles.Date}>{moment(timestamp).format('h:mm A - D MMM YYYY')}</span>
              )}
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
                  {isZeroProSubscriber && <IconZeroProVerified size={18} />}
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
                  {!(isPending || isFailed) && (
                    <>
                      {featureFlags.enableComments && (
                        <PreventPropagation>
                          <ReplyAction postId={messageId} numberOfReplies={numberOfReplies} />
                        </PreventPropagation>
                      )}
                      {featureFlags.enableQuotes && (
                        <PreventPropagation>
                          <QuoteAction
                            numberOfQuotes={reactions?.QUOTE}
                            quotingPost={{
                              id: messageId,
                              userId: authorPrimaryZid ?? authorPublicAddress,
                              zid: authorPrimaryZid ?? authorPublicAddress,
                              createdAt: timestamp.toString(),
                              text: text,
                              arweaveId: arweaveId,
                              userProfileView: {
                                userId: authorPrimaryZid ?? authorPublicAddress,
                                firstName: nickname,
                                profileImage: avatarUrl,
                                isZeroProSubscriber: isZeroProSubscriber,
                              },
                              mediaId,
                            }}
                          />
                        </PreventPropagation>
                      )}
                      <PreventPropagation>
                        <MeowAction
                          meows={reactions?.MEOW || 0}
                          isDisabled={isDisabled}
                          messageId={messageId}
                          meowPost={meowPost}
                          hasUserVoted={reactions?.VOTED > 0}
                        />
                      </PreventPropagation>
                    </>
                  )}
                </div>
                <div>
                  {error && <div className={styles.Error}>{error}</div>}
                  {(isPending || isFailed) && (
                    <PreventPropagation>
                      <StatusAction status={isPending ? 'pending' : 'failed'} optimisticId={messageId} />
                    </PreventPropagation>
                  )}
                  {channelZid && !isPending && !isFailed && (
                    <PreventPropagation>
                      <FeedAction channelZid={channelZid} />
                    </PreventPropagation>
                  )}
                  {!isPending && !isFailed && (
                    <PreventPropagation>
                      <ArweaveAction arweaveId={arweaveId} />
                    </PreventPropagation>
                  )}
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
  const isOptimisticPost = useSelector(isOptimisticPostSelector(postId));

  const handleOnClick = () => {
    if (isOptimisticPost) {
      return;
    }

    if (variant === 'default') {
      navigateToPost();
    }
  };

  return (
    <div
      className={styles.Wrapper}
      data-disabled={isOptimisticPost ? '' : null}
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
