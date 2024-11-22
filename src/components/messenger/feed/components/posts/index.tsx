import { Post } from '../post';

import styles from './styles.module.scss';

export const Posts = ({
  postMessages,
  loadAttachmentDetails,
  transferMeow,
  userMeowBalance,
  currentUserId,
  meowPost,
}) => {
  return (
    <ol className={styles.Posts}>
      {postMessages.map((post) => (
        <li key={post.id}>
          <Post
            currentUserId={currentUserId}
            messageId={post.id}
            media={post.media}
            avatarUrl={post.sender.profileImage}
            text={post.message}
            nickname={post.sender.firstName}
            timestamp={post.createdAt}
            author={post.sender.displaySubHandle}
            loadAttachmentDetails={loadAttachmentDetails}
            ownerUserId={post.sender.userId}
            transferMeow={transferMeow}
            userMeowBalance={userMeowBalance}
            reactions={post.reactions}
            meowPost={meowPost}
          />
        </li>
      ))}
    </ol>
  );
};
