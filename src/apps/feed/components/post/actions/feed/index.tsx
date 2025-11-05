import { useFeedAction } from './useFeedAction';

import { Action } from '@zero-tech/zui/components/Post';

import styles from './styles.module.scss';

export interface FeedActionProps {
  channelZid: string;
}

export const FeedAction = ({ channelZid }: FeedActionProps) => {
  const { handleOnClick } = useFeedAction(channelZid);

  const isWallet = channelZid.startsWith('0x') && channelZid.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(channelZid);
  return (
    <Action className={styles.Container} onClick={isWallet ? undefined : handleOnClick}>
      <span>{isWallet ? channelZid : `0://${channelZid}`}</span>
    </Action>
  );
};
