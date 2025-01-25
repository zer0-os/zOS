import { useFeed } from './lib/useFeed';

import { Header } from '../header';
import { Message } from '../message';
import { Post } from '../post';
import { PostInput } from '../post-input-hook';
import { Waypoint } from 'react-waypoint';

import styles from './styles.module.scss';

export interface FeedProps {
  zid?: string;
}

export const Feed = ({ zid }: FeedProps) => {
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
    userId,
    userMeowBalance,
  } = useFeed(zid);

  return (
    <div className={styles.Feed}>
      <Header>{headerText}</Header>
      {channelZid && <PostInput className={styles.Input} channelZid={channelZid} />}
      {isLoading && <Message>Loading posts</Message>}
      {isEmpty && <Message>This feed is empty</Message>}
      {hasLoadedMessages && (
        <ol>
          {posts?.pages.map((page) =>
            page.map((reply) => (
              <li key={reply.id}>
                <Post
                  arweaveId={reply.arweaveId}
                  avatarUrl={reply.sender?.avatarUrl}
                  author={reply.sender?.displaySubHandle}
                  channelZid={reply.channelZid}
                  currentUserId={userId}
                  loadAttachmentDetails={() => {}}
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
                />
              </li>
            ))
          )}
        </ol>
      )}
      {isError && <Message>Failed to load posts</Message>}
      {isFetchingNextPage && <Message>Loading more posts</Message>}
      {hasNextPage && !isFetchingNextPage && !isError && <Waypoint onEnter={() => fetchNextPage()} />}
    </div>
  );
};
