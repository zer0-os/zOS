import { Action } from '@zero-tech/zui/components/Post';

import { IconShare01 } from '@zero-tech/zui/icons';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { primaryZIDSelector, currentUserSelector } from '../../../../../../store/authentication/selectors';
import { PostModal } from '../../../../../../components/app-bar/post-button/modal';
import { setQuotingPost } from '../../../../../../store/posts';
import { QuotedPost } from '../../../feed/lib/types';

interface QuoteActionProps {
  numberOfQuotes: number;
  quotingPost?: QuotedPost;
}

export const QuoteAction = ({ numberOfQuotes, quotingPost }: QuoteActionProps) => {
  const dispatch = useDispatch();
  const userZid = useSelector(primaryZIDSelector);
  const currentUser = useSelector(currentUserSelector);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Allow quoting if user has either ZID or any wallet
  const canQuote =
    userZid ||
    currentUser?.zeroWalletAddress ||
    currentUser?.primaryWalletAddress ||
    (currentUser?.wallets && currentUser.wallets.length > 0);

  const handleOnClick = () => {
    setIsPostModalOpen(true);
    dispatch(setQuotingPost(quotingPost));
  };

  const handleOnOpenChange = (open: boolean) => {
    setIsPostModalOpen(open);
    dispatch(setQuotingPost(undefined));
  };

  return (
    <>
      <Action onClick={handleOnClick} disabled={!canQuote}>
        <IconShare01 size={16} />
        <span>{numberOfQuotes}</span>
      </Action>
      <PostModal open={isPostModalOpen} onOpenChange={handleOnOpenChange} />
    </>
  );
};
