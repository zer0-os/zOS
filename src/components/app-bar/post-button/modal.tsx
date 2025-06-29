import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Modal } from '@zero-tech/zui/components/Modal';
import { PostInput } from '../../../apps/feed/components/post-input-hook';
import { primaryZIDSelector } from '../../../store/authentication/selectors';

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
  const userZid = useSelector(primaryZIDSelector);
  const history = useHistory();

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
    history.push('/home');
    onOpenChange(false);
  };

  return (
    <div ref={containerRef}>
      <PostInput className={styles.PostInput} channelZid={userZid} onSubmit={handleOnSubmit} />
    </div>
  );
};
