import { useState } from 'react';

import { primaryZIDSelector } from '../../../store/authentication/selectors';
import { useSelector } from 'react-redux';

import { PostModal } from './modal';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconPlus } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

export const PostButton = () => {
  const userZid = useSelector(primaryZIDSelector);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  if (!userZid) {
    return null;
  }

  return (
    <>
      <IconButton
        className={styles.Button}
        size={32}
        Icon={() => <IconPlus color='var(--color-greyscale-11)' size={24} />}
        onClick={() => setIsPostModalOpen(true)}
        title='Write a Post'
        aria-label='Write a Post'
      />
      <PostModal open={isPostModalOpen} onOpenChange={setIsPostModalOpen} />
    </>
  );
};
