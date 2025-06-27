import { useSelector } from 'react-redux';
import { useReplyList } from './useReplyList';
import { postStatusSelector } from '../../../../../store/post-queue/selectors';

import { Post } from '../../post';
import { Waypoint } from '../../../../../components/waypoint';
import styles from './styles.module.scss';

export interface RepliesProps {
  postId: string;
  isFeed?: boolean;
}

interface ReplyItemProps {
  reply: any;
  userId?: string;
  userMeowBalance?: string;
  meowPost: (postId: string, meowAmount: string) => void;
  meowPostFeed: (postId: string, meowAmount: string) => void;
  isFeed?: boolean;
}

const ReplyItem = ({ reply, userId, userMeowBalance, meowPost, meowPostFeed, isFeed }: ReplyItemProps) => {
  const status = useSelector(postStatusSelector(reply.optimisticId));
  const isPending = status === 'pending';
  const isFailed = status === 'failed';

  return (
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
        isZeroProSubscriber={reply.sender?.isZeroProSubscriber}
        isPending={isPending}
        isFailed={isFailed}
      />
    </li>
  );
};

export const Replies = ({ postId, isFeed }: RepliesProps) => {
  const { fetchNextPage, hasNextPage, isFetchingNextPage, replies, userId, userMeowBalance, meowPost, meowPostFeed } =
    useReplyList(postId);

  return (
    <div className={styles.Replies}>
      <ol>
        {replies?.pages.map((page) =>
          page.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              userId={userId}
              userMeowBalance={userMeowBalance}
              meowPost={meowPost}
              meowPostFeed={meowPostFeed}
              isFeed={isFeed}
            />
          ))
        )}
      </ol>
      {hasNextPage && !isFetchingNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
    </div>
  );
};
