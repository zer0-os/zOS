import { ViewModes } from '../../../../shared-components/theme-engine';
import { usePostInput } from './usePostInput';

import { PostInput as PostInputComponent } from '../post-input';

export interface PostInputProps {
  className?: string;
  channelZid: string;
  replyToId?: string;
}

export const PostInput = ({ className, channelZid, replyToId }: PostInputProps) => {
  const { error, handleOnSubmit, isLoading, userProfileImageUrl } = usePostInput(channelZid, replyToId);

  return (
    <PostInputComponent
      avatarUrl={userProfileImageUrl}
      className={className}
      error={error?.message}
      isSubmitting={isLoading}
      onSubmit={handleOnSubmit}
      viewMode={ViewModes.Dark}
    />
  );
};
