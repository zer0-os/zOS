import { Post } from '../post';
import { MOCK_POSTS } from '../../mock';

import styles from './styles.module.scss';

export const Posts = () => {
  return (
    <ol className={styles.Posts}>
      {MOCK_POSTS.map((post) => (
        <li key={post.id}>
          <Post post={post} />
        </li>
      ))}
    </ol>
  );
};
