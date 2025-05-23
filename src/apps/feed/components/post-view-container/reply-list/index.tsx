import { useReplyList } from './useReplyList';

import { Post } from '../../post';
import { Waypoint } from '../../../../../components/waypoint';
import styles from './styles.module.scss';

export interface RepliesProps {
  postId: string;
  isFeed?: boolean;
}

export const Replies = ({ postId, isFeed }: RepliesProps) => {
  const { fetchNextPage, hasNextPage, isFetchingNextPage, replies, userId, userMeowBalance, meowPost, meowPostFeed } =
    useReplyList(postId);

  return (
    <div className={styles.Replies}>
      <ol>
        {replies?.pages.map((page) =>
          page.map((reply) => (
            <li key={reply.id} className={styles.Reply}>
              <Post
                arweaveId={reply.arweaveId}
                variant='default'
                messageId={reply.id.toString()}
                timestamp={reply.createdAt}
                author={reply.sender?.displaySubHandle}
                nickname={reply.sender?.firstName}
                text={reply.message}
                meowPost={isFeed ? meowPostFeed : meowPost}
                currentUserId={userId}
                reactions={reply.reactions}
                ownerUserId={reply.sender?.userId}
                userMeowBalance={userMeowBalance}
                numberOfReplies={reply.numberOfReplies}
                channelZid={reply.channelZid}
                avatarUrl={reply.sender?.avatarUrl}
                mediaId={reply.mediaId}
                authorPrimaryZid={reply.sender?.primaryZid}
                authorPublicAddress={reply.sender?.publicAddress}
              />
            </li>
          ))
        )}
      </ol>
      {hasNextPage && !isFetchingNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
    </div>
  );
};
