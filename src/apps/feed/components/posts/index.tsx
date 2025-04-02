import { Post } from '../post';

import styles from './styles.module.scss';

export const Posts = ({
  postMessages,
  userMeowBalance,
  currentUserId,
  meowPost,
  shouldRenderMessage,
  sortMessages,
}) => {
  return (
    <ol className={styles.Posts}>
      {sortMessages(postMessages)
        .filter(shouldRenderMessage)
        .map((post) => (
          <li key={post.id}>
            <Post
              arweaveId={post.arweaveId}
              currentUserId={currentUserId}
              messageId={post.id}
              media={post.media}
              avatarUrl={post.sender.profileImage}
              text={post.message}
              nickname={post.sender.firstName}
              timestamp={post.createdAt}
              author={post.sender.displaySubHandle}
              ownerUserId={post.sender.userId}
              userMeowBalance={userMeowBalance}
              reactions={post.reactions}
              meowPost={meowPost}
              numberOfReplies={post.numberOfReplies}
            />
          </li>
        ))}
    </ol>
  );
};
