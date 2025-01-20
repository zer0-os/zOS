import { ViewModes } from '../../../../shared-components/theme-engine';
import { usePostInput } from './usePostInput';

import { PostInput as PostInputComponent } from '../post-input';

export interface PostInputProps {
  className?: string;
  channelZid: string;
  replyToId?: string;
}

export const PostInput = ({ className, channelZid, replyToId }: PostInputProps) => {
  const { error, handleOnSubmit, isLoading, isWalletConnected } = usePostInput(channelZid, replyToId);

  return (
    <PostInputComponent
      className={className}
      error={error?.message}
      isSubmitting={isLoading}
      isWalletConnected={isWalletConnected}
      onSubmit={handleOnSubmit}
      viewMode={ViewModes.Dark}
    />
  );
};
