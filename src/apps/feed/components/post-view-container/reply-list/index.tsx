import { useReplyList } from './useReplyList';

import { Post } from '../../post';
import { Waypoint } from 'react-waypoint';

import styles from './styles.module.scss';

export const Replies = ({ postId }: { postId: string }) => {
  const { fetchNextPage, hasNextPage, isFetchingNextPage, replies, userId, userMeowBalance, meowPost } =
    useReplyList(postId);

  return (
    <div className={styles.Replies}>
      <ol>
        {replies?.pages.map((page) =>
          page.map((reply) => (
            <li key={reply.id} className={styles.Reply}>
              <Post
                variant='default'
                messageId={reply.id.toString()}
                timestamp={reply.createdAt}
                author={reply.sender?.displaySubHandle}
                nickname={reply.sender?.firstName}
                text={reply.message}
                loadAttachmentDetails={() => {}}
                meowPost={meowPost}
                currentUserId={userId}
                reactions={reply.reactions}
                ownerUserId={reply.sender?.userId}
                userMeowBalance={userMeowBalance}
                numberOfReplies={reply.numberOfReplies}
              />
            </li>
          ))
        )}
      </ol>
      {hasNextPage && !isFetchingNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
    </div>
  );
};
