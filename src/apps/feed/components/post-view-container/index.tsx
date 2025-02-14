import { usePostView } from './usePostView';

import { BackButton } from './back-button';
import { CommentInput } from '../comment-input';
import { Header } from '../header';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Post } from '../post';
import { Replies } from './reply-list';
import { ScrollbarContainer } from '../../../../components/scrollbar-container';
import { Panel } from '../../../../components/layout/panel';
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
        <Panel>
          <Message>
            <IconAlertCircle size={16} /> Failed to load post
          </Message>
        </Panel>
      </Wrapper>
    );
  }

  return (
    <ScrollbarContainer variant='on-hover' className={styles.Scroll}>
      <Wrapper isFeed={isFeed}>
        {post !== undefined && (
          <>
            <Header>
              <BackButton backToId={post.replyTo?.id} />
            </Header>
            <div className={styles.Details}>
              <Panel>
                <Post
                  arweaveId={post.arweaveId}
                  avatarUrl={post.sender?.avatarUrl}
                  author={post.sender?.displaySubHandle}
                  className={styles.Post}
                  currentUserId={userId}
                  loadAttachmentDetails={() => {}}
                  media={post.media}
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
                />
              </Panel>
              <Panel>
                <CommentInput channelZid={post.channelZid} isFeed={isFeed} postId={postId} />
              </Panel>
            </div>
            <Replies postId={postId} isFeed={isFeed} />
          </>
        )}
      </Wrapper>
    </ScrollbarContainer>
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
