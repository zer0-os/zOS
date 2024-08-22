import { Name, Post as ZUIPost } from '@zero-tech/zui/components/Post';
import { Timestamp } from '@zero-tech/zui/components/Post/components/Timestamp';
import { Avatar } from '@zero-tech/zui/components';

import styles from './styles.module.scss';

export interface PostProps {
  timestamp: number;
  author?: string;
  nickname: string;
  text: string;
}

export const Post = ({ text, nickname, author, timestamp }: PostProps) => {
  return (
    <div className={styles.Container}>
      <div>
        <Avatar size='regular' />
      </div>
      <ZUIPost
        className={styles.Post}
        body={text}
        details={
          <>
            {/* @ts-ignore */}
            <Name variant='name'>{nickname}</Name>
            {/* @ts-ignore */}
            <Name variant='username'>{author}</Name>
          </>
        }
        options={<Timestamp timestamp={timestamp} />}
      />
    </div>
  );
};
