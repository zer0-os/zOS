import { usePostView } from './usePostView';

import { Post } from '../post';
import { CommentInput } from '../comment-input';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { BackButton } from './back-button';
import { Replies } from './reply-list';
import { ScrollbarContainer } from '../../../../components/scrollbar-container';

import styles from './styles.module.scss';

export interface PostViewProps {
  postId: string;
}

export const PostView = ({ postId }: PostViewProps) => {
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
            <BackButton backToId={post.replyTo?.id} />
            <div className={styles.Details}>
              <Post
                variant='expanded'
                className={styles.Post}
                messageId={post.id.toString()}
                timestamp={post.createdAt}
                author={post.sender?.displaySubHandle}
                nickname={post.sender?.firstName}
                text={post.message}
                loadAttachmentDetails={() => {}}
                meowPost={meowPost}
                currentUserId={userId}
                ownerUserId={post.sender?.userId}
                userMeowBalance={userMeowBalance}
                reactions={post.reactions}
                media={post.media}
                numberOfReplies={post.numberOfReplies}
              />
              <CommentInput postId={postId} />
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
