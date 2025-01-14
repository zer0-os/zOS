import { useMainFeed } from './useMainFeed';

import { PostInputContainer as PostInput } from '../post-input/container';
import { FeedViewContainer } from '../feed-view-container/feed-view-container';
import { ScrollbarContainer } from '../../../../components/scrollbar-container';

export const MainFeed = () => {
  const { activeConversationId, isSubmittingPost, onSubmitPost } = useMainFeed();

  return (
    <ScrollbarContainer variant='on-hover'>
      <PostInput id={activeConversationId} onSubmit={onSubmitPost} isSubmitting={isSubmittingPost} />
      <FeedViewContainer channelId={activeConversationId} />
    </ScrollbarContainer>
  );
};
