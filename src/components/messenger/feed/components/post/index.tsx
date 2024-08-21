import { Action, Name, Post as ZUIPost } from '@zero-tech/zui/components/Post';
import { Timestamp } from '@zero-tech/zui/components/Post/components/Timestamp';
import { IconMessageSquare2, IconShare7 } from '@zero-tech/zui/icons';
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
        actions={
          <>
            <Action>
              <IconMessageSquare2 size={16} />
              230
            </Action>
            <Action>
              <IconShare7 size={16} />
              100
            </Action>
            <Action>
              <svg width='15' height='13' viewBox='0 0 16 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M12.8113 8.32429C11.3858 10.7087 8.45708 10.3566 8.45708 10.3566C8.45708 6.03666 12.2491 6.03666 12.2491 6.03666H13.5226C13.4189 6.99328 13.1604 7.74064 12.8113 8.32429ZM3.18868 8.32429C2.83962 7.74064 2.58113 6.99328 2.47736 6.03666H3.75094C3.75094 6.03666 7.54292 6.03666 7.54292 10.3566C7.54292 10.3566 4.61415 10.7087 3.18868 8.32429ZM14.3193 0.333496L10.2726 3.51273H5.72736L1.68066 0.333496L0.5 7.87682L5.46745 13.3793C5.54906 13.4699 5.64906 13.5425 5.76038 13.5919C5.8717 13.6412 5.99198 13.6668 6.11368 13.6668H9.88632C10.008 13.6668 10.1283 13.6412 10.2396 13.5919C10.3509 13.5425 10.4505 13.4699 10.5325 13.3793L15.5 7.87682L14.3193 0.333496Z'
                  fill='#01F4CB'
                />
              </svg>
              100.20
            </Action>
          </>
        }
      />
    </div>
  );
};
