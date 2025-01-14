import { Action } from '@zero-tech/zui/components/Post';
import { IconMessageChatSquare } from '@zero-tech/zui/components/Icons';
import { useReplyAction } from './useReplyAction';

import styles from './reply-action.module.scss';

export interface ReplyActionProps {
  postId: string;
  numberOfReplies: number;
}

export const ReplyAction = ({ postId, numberOfReplies }: ReplyActionProps) => {
  const { handleOnClick } = useReplyAction(postId);

  return (
    <Action className={styles.Container} onClick={handleOnClick}>
      <IconMessageChatSquare size={16} />
      <span>{numberOfReplies > 9 ? '9+' : numberOfReplies}</span>
    </Action>
  );
};
