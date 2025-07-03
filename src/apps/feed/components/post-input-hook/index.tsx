import { ViewModes } from '../../../../shared-components/theme-engine';
import { usePostInput } from './usePostInput';

import { PostInput as PostInputComponent } from '../post-input';

export interface PostInputProps {
  className?: string;
  channelZid: string;
  replyToId?: string;
  onSubmit?: (message: string, mediaId?: string) => void;
}

export const PostInput = ({ className, channelZid, replyToId, onSubmit }: PostInputProps) => {
  const { handleOnSubmit, userProfileImageUrl, quotingPost } = usePostInput(channelZid, replyToId, onSubmit);

  return (
    <PostInputComponent
      avatarUrl={userProfileImageUrl}
      className={className}
      onSubmit={handleOnSubmit}
      viewMode={ViewModes.Dark}
      quotingPost={quotingPost}
    />
  );
};
