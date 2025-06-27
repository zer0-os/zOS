import { useCommentInput } from './useCommentInput';
import { ViewModes } from '../../../../shared-components/theme-engine';

import { PostInput } from '../post-input';

import styles from './styles.module.scss';

export interface CommentInputProps {
  channelZid?: string;
  isFeed?: boolean;
  postId: string;
}

export const CommentInput = ({ channelZid, isFeed, postId }: CommentInputProps) => {
  const { onSubmit, onSubmitFeed, userProfileImageUrl } = useCommentInput(postId, channelZid);

  return (
    <PostInput
      avatarUrl={userProfileImageUrl}
      className={styles.Input}
      onSubmit={isFeed ? onSubmitFeed : onSubmit}
      variant='comment'
      viewMode={ViewModes.Dark}
    />
  );
};
