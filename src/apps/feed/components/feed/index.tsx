import { useLocation } from 'react-router-dom';
import { useFeed } from './lib/useFeed';
import { Message } from '../message';
import { Post } from '../post';
import { PostInput } from '../post-input-hook';
import { Waypoint } from '../../../../components/waypoint';
import { Panel, PanelBody, PanelHeader, PanelTitle, PanelTitleToggle } from '../../../../components/layout/panel';
import { useState, useEffect } from 'react';
import { FeedFilter, getLastFeedFilter, setLastFeedFilter } from '../../../../lib/last-feed-filter';
import { useReturnFromProfileNavigation } from '../../lib/useReturnFromProfileNavigation';
import { BackButton } from '../post-view-container/back-button';
import { SearchDrawer } from './search-drawer';

import styles from './styles.module.scss';

const FEED_TOGGLE_OPTIONS = [
  { key: FeedFilter.Following, label: 'Following' },
  { key: FeedFilter.All, label: 'All' },
];

export interface FeedProps {
  /**
   * Filter by channel ZID, e.g. "posts in 0://foo".
   */
  zid?: string;
  /**
   * Filter by author user ID.
   */
  userId?: string;
  isPostingEnabled?: boolean;
  isLoading?: boolean;
  /**
   * Whether to show the following toggle
   */
  showFollowingToggle?: boolean;
}

export const Feed = ({
  zid,
  isPostingEnabled = true,
  userId,
  isLoading: isLoadingProp,
  showFollowingToggle = false,
}: FeedProps) => {
  const [selectedFilter, setSelectedFilter] = useState<FeedFilter>(getLastFeedFilter());
  const location = useLocation();
  const isProfileRoute = location.pathname.startsWith('/profile');

  useEffect(() => {
    if (showFollowingToggle) {
      setLastFeedFilter(selectedFilter);
    }
  }, [selectedFilter, showFollowingToggle]);

  const feedProps = {
    zid,
    userId,
    isLoading: isLoadingProp,
    ...(showFollowingToggle ? { following: selectedFilter === FeedFilter.Following } : {}),
  };

  const {
    channelZid,
    fetchNextPage,
    hasLoadedMessages,
    hasNextPage,
    headerText,
    isEmpty,
    isError,
    isFetchingNextPage,
    isLoading,
    meowPostFeed,
    posts,
    currentUserId,
    userMeowBalance,
    searchResults,
    isSearching,
    handleSearch,
    searchValue,
  } = useFeed(feedProps);

  useReturnFromProfileNavigation();

  const renderHeader = () => {
    if (isProfileRoute) {
      return <BackButton />;
    }

    if (!showFollowingToggle) {
      return <PanelTitle>{headerText}</PanelTitle>;
    }
    return (
      <PanelTitleToggle
        options={FEED_TOGGLE_OPTIONS}
        value={selectedFilter}
        onChange={(key) => setSelectedFilter(key as FeedFilter)}
      />
    );
  };

  return (
    <Panel className={styles.Feed}>
      <PanelHeader>
        {renderHeader()}
        <SearchDrawer
          searchResults={searchResults}
          isSearching={isSearching}
          onSearch={handleSearch}
          searchValue={searchValue}
        />
      </PanelHeader>
      <PanelBody className={styles.Panel}>
        {channelZid && isPostingEnabled && <PostInput className={styles.Input} channelZid={channelZid} />}
        {isLoading && <Message>Loading posts...</Message>}
        {isEmpty && <Message>This feed is empty</Message>}
        {hasLoadedMessages && (
          <ol>
            {posts?.pages.map((page) =>
              page.map((reply) => (
                <li key={reply.id}>
                  <Post
                    className={styles.Post}
                    arweaveId={reply.arweaveId}
                    avatarUrl={reply.sender?.avatarUrl}
                    author={reply.sender?.displaySubHandle}
                    channelZid={reply.channelZid}
                    currentUserId={currentUserId}
                    meowPost={meowPostFeed}
                    messageId={reply.id.toString()}
                    nickname={reply.sender?.firstName}
                    numberOfReplies={reply.numberOfReplies}
                    ownerUserId={reply.sender?.userId}
                    reactions={reply.reactions}
                    text={reply.message}
                    timestamp={reply.createdAt}
                    userMeowBalance={userMeowBalance}
                    variant='default'
                    authorPrimaryZid={reply.sender?.primaryZid}
                    authorPublicAddress={reply.sender?.publicAddress}
                    mediaId={reply.mediaId}
                  />
                </li>
              ))
            )}
          </ol>
        )}
        {isError && <Message>Failed to load posts</Message>}
        {isFetchingNextPage && <Message>Loading more posts</Message>}
        {hasNextPage && !isFetchingNextPage && !isError && (
          <Waypoint onEnter={() => fetchNextPage()} bottomOffset={'-90%'} />
        )}
      </PanelBody>
    </Panel>
  );
};
