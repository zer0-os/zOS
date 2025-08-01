import { usePostView } from './usePostView';

import { BackButton } from './back-button';
import { CommentInput } from '../comment-input';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Post } from '../post';
import { Replies } from './reply-list';
import { LegacyPanel, Panel, PanelBody, PanelHeader } from '../../../../components/layout/panel';

import styles from './styles.module.scss';

export interface PostViewProps {
  isFeed?: boolean;
  postId: string;
}

export const PostView = ({ postId, isFeed }: PostViewProps) => {
  const { isLoadingPost, meowPost, meowPostFeed, post, userId, userMeowBalance } = usePostView(postId);

  if (!isLoadingPost && !post) {
    return (
      <Wrapper isFeed={isFeed}>
        <LegacyPanel>
          <Message>
            <IconAlertCircle size={16} /> Failed to load post
          </Message>
        </LegacyPanel>
      </Wrapper>
    );
  }

  return (
    <Panel className={styles.Wrapper}>
      <PanelHeader>
        <BackButton backToId={post?.replyTo?.id} />
      </PanelHeader>
      <PanelBody className={styles.Panel}>
        {post !== undefined && (
          <>
            <div className={styles.Details}>
              <Post
                arweaveId={post.arweaveId}
                avatarUrl={post.sender?.avatarUrl}
                author={post.sender?.displaySubHandle}
                className={styles.Post}
                currentUserId={userId}
                meowPost={isFeed ? meowPostFeed : meowPost}
                messageId={post.id.toString()}
                nickname={post.sender?.firstName}
                numberOfReplies={post.numberOfReplies}
                ownerUserId={post.sender?.userId}
                reactions={post.reactions}
                text={post.message}
                timestamp={post.createdAt}
                userMeowBalance={userMeowBalance}
                variant='expanded'
                channelZid={post.channelZid}
                isSinglePostView={true}
                mediaId={post.mediaId}
                authorPrimaryZid={post.sender?.primaryZid}
                authorPublicAddress={post.sender?.publicAddress}
                isZeroProSubscriber={post.sender?.isZeroProSubscriber}
              />
              <CommentInput channelZid={post.channelZid} isFeed={isFeed} postId={postId} />
            </div>
            <Replies postId={postId} isFeed={isFeed} />
          </>
        )}
      </PanelBody>
    </Panel>
  );
};

const Message = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.Message}>{children}</div>;
};

const Wrapper = ({ children, isFeed }: { children: React.ReactNode; isFeed?: boolean }) => {
  return (
    <div className={styles.Wrapper} data-is-feed={isFeed ? '' : undefined}>
      {children}
    </div>
  );
};
