import { Name, Post as ZUIPost } from '@zero-tech/zui/components/Post';
import { Timestamp } from '@zero-tech/zui/components/Post/components/Timestamp';
import { Avatar } from '@zero-tech/zui/components';
import { MeowAction } from './meow-action';

import styles from './styles.module.scss';
import { useMemo } from 'react';
import { featureFlags } from '../../../../../lib/feature-flags';

export interface PostProps {
  avatarUrl?: string;
  timestamp: number;
  author?: string;
  nickname: string;
  text: string;
}

export const Post = ({ avatarUrl, text, nickname, author, timestamp }: PostProps) => {
  const isMeowsEnabled = featureFlags.enableMeows;

  const multilineText = useMemo(
    () =>
      text.split('\n').map((line, index) => (
        <p key={index} className={styles.Text}>
          {line}
        </p>
      )),
    [text]
  );

  return (
    <div className={styles.Container} has-author={author ? '' : null}>
      <div className={styles.Avatar}>
        <Avatar size='regular' imageURL={avatarUrl} />
      </div>
      <ZUIPost
        className={styles.Post}
        body={<div className={styles.Body}>{multilineText}</div>}
        details={
          <>
            {/* @ts-ignore */}
            <Name className={styles.Name} variant='name'>
              {nickname}
            </Name>
            {author && (
              <>
                {/* @ts-ignore */}
                <Name className={styles.UserName} variant='username'>
                  {author}
                </Name>
              </>
            )}
          </>
        }
        options={<Timestamp className={styles.Date} timestamp={timestamp} />}
        actions={isMeowsEnabled && <MeowAction />}
      />
    </div>
  );
};
