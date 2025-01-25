import { useFeedAction } from './useFeedAction';

import { Action } from '@zero-tech/zui/components/Post';

import styles from './styles.module.scss';

export interface FeedActionProps {
  channelZid: string;
}

export const FeedAction = ({ channelZid }: FeedActionProps) => {
  const { handleOnClick } = useFeedAction(channelZid);

  return (
    <Action className={styles.Container} onClick={handleOnClick}>
      <span>0://{channelZid}</span>
    </Action>
  );
};
