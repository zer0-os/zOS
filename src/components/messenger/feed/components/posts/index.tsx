import { Post } from '../post';

import styles from './styles.module.scss';

export const Posts = ({ postMessages }) => {
  return (
    <ol className={styles.Posts}>
      {postMessages.map((post) => (
        <li key={post.id}>
          <Post
            avatarUrl={post.sender.profileImage}
            text={post.message}
            nickname={post.sender.firstName}
            timestamp={post.createdAt}
          />
        </li>
      ))}
    </ol>
  );
};
