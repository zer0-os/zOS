import { usePostView } from './usePostView';

import { BackButton } from './back-button';
import { CommentInput } from '../comment-input';
import { Header } from '../header';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Post } from '../post';
import { Replies } from './reply-list';
import { ScrollbarContainer } from '../../../../components/scrollbar-container';

import styles from './styles.module.scss';

export interface PostViewProps {
  isFeed?: boolean;
  postId: string;
}

export const PostView = ({ postId, isFeed }: PostViewProps) => {
  const { isLoadingPost, meowPost, post, userId, userMeowBalance } = usePostView(postId);

  if (!isLoadingPost && !post) {
    return (
      <Wrapper>
        <Message>
          <IconAlertCircle size={16} /> Failed to load post
        </Message>
      </Wrapper>
    );
  }

  return (
    <ScrollbarContainer variant='on-hover'>
      <Wrapper>
        {post !== undefined && (
          <>
            <Header>
              <BackButton backToId={post.replyTo?.id} />
            </Header>
            <div className={styles.Details}>
              <Post
                author={post.sender?.displaySubHandle}
                className={styles.Post}
                currentUserId={userId}
                loadAttachmentDetails={() => {}}
                media={post.media}
                meowPost={meowPost}
                messageId={post.id.toString()}
                nickname={post.sender?.firstName}
                numberOfReplies={post.numberOfReplies}
                ownerUserId={post.sender?.userId}
                reactions={post.reactions}
                text={post.message}
                timestamp={post.createdAt}
                userMeowBalance={userMeowBalance}
                variant='expanded'
              />
              <CommentInput channelZid={post.channelZid} isFeed={isFeed} postId={postId} />
            </div>
            <Replies postId={postId} />
          </>
        )}
      </Wrapper>
    </ScrollbarContainer>
  );
};

const Message = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.Message}>{children}</div>;
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.Wrapper}>{children}</div>;
};
