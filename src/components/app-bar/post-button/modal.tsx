import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { Modal } from '@zero-tech/zui/components/Modal';
import { PostInput } from '../../../apps/feed/components/post-input-hook';
import { primaryZIDSelector, currentUserSelector } from '../../../store/authentication/selectors';
import { quotingPostSelector } from '../../../store/posts/selectors';

import styles from './styles.module.scss';

export interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostModal = ({ open, onOpenChange }: PostModalProps) => {
  return (
    <Modal className={styles.Modal} open={open} onOpenChange={onOpenChange}>
      <Content onOpenChange={onOpenChange} />
    </Modal>
  );
};

const Content = ({ onOpenChange }: { onOpenChange: (open: boolean) => void }) => {
  const primaryZID = useSelector(primaryZIDSelector);
  const currentUser = useSelector(currentUserSelector);
  const quotingPost = useSelector(quotingPostSelector);
  const history = useHistory();
  const route = useRouteMatch<{ zid: string }>('/feed/:zid');

  // Use current channel ZID if on a channel feed, otherwise use user's primary ZID or Z wallet
  const channelZid = route?.params?.zid || primaryZID || currentUser?.zeroWalletAddress;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      requestAnimationFrame(() => {
        const textarea = containerRef.current?.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      });
    }
  }, [containerRef]);

  const handleOnSubmit = () => {
    // If posting to a channel, stay on channel feed; otherwise go to home
    if (quotingPost && route?.params?.zid) {
      history.push(`/feed/${route.params.zid}`);
    } else {
      history.push('/home');
    }
    onOpenChange(false);
  };

  return (
    <div ref={containerRef}>
      <PostInput className={styles.PostInput} channelZid={channelZid} onSubmit={handleOnSubmit} />
    </div>
  );
};
