import { useFeed } from './lib/useFeed';

import { Header } from '../header';
import { Message } from '../message';
import { Post } from '../post';
import { Waypoint } from 'react-waypoint';

import styles from './styles.module.scss';

export interface FeedProps {
  zid?: string;
}

export const Feed = ({ zid }: FeedProps) => {
  const {
    fetchNextPage,
    hasLoadedMessages,
    hasNextPage,
    isEmpty,
    isError,
    isFetchingNextPage,
    isLoading,
    meowPost,
    posts,
    userId,
    userMeowBalance,
    headerText,
  } = useFeed(zid);

  return (
    <div className={styles.Feed}>
      <Header>{headerText}</Header>
      {isLoading && <Message>Loading posts</Message>}
      {isEmpty && <Message>This feed is empty</Message>}
      {hasLoadedMessages && (
        <ol>
          {posts?.pages.map((page) =>
            page.map((reply) => (
              <li key={reply.id}>
                <Post
                  author={reply.sender?.displaySubHandle}
                  currentUserId={userId}
                  loadAttachmentDetails={() => {}}
                  meowPost={meowPost}
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
