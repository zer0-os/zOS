import { ViewModes } from '../../../../shared-components/theme-engine';
import { PostInput } from '../post-input';

import styles from './styles.module.scss';
import { useCommentInput } from './useCommentInput';

export interface CommentInputProps {
  postId: string;
}

export const CommentInput = ({ postId }: CommentInputProps) => {
  const { error, isConnected, onSubmit } = useCommentInput(postId);

  return (
    <PostInput
      className={styles.Input}
      viewMode={ViewModes.Dark}
      isWalletConnected={isConnected}
      onSubmit={onSubmit}
      variant='comment'
      error={error}
    />
  );
};
