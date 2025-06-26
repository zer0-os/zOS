import { Action } from '@zero-tech/zui/components/Post';
import { IconLoading2 } from '@zero-tech/zui/icons';
import { useDispatch, useSelector } from 'react-redux';

import classNames from 'classnames';
import styles from './styles.module.scss';
import { removeQueuedPost } from '../../../../../../store/post-queue';
import { queuedPostByIdSelector } from '../../../../../../store/post-queue/selectors';
import { useSubmitPost } from '../../../../lib/useSubmitPost';

interface StatusActionProps {
  optimisticId?: string;
  status: 'pending' | 'failed';
}

export const StatusAction = ({ status, optimisticId }: StatusActionProps) => {
  const dispatch = useDispatch();
  const queuedPost = useSelector(queuedPostByIdSelector(optimisticId));
  const { handleOnSubmit: handleOnSubmitPost } = useSubmitPost();

  const isDisabled = status === 'pending';
  const className = status === 'failed' ? styles.Failed : styles.Pending;

  const label = status === 'pending' ? 'Posting' : 'Retry Upload';

  const handleOnClickRetry = () => {
    if (queuedPost) {
      handleOnSubmitPost(queuedPost.params);
    }
    dispatch(removeQueuedPost(optimisticId));
  };

  const handleOnClick = status === 'failed' ? handleOnClickRetry : undefined;

  return (
    <Action disabled={isDisabled} className={classNames(styles.Action, className)} onClick={handleOnClick}>
      {status === 'pending' && <IconLoading2 size={12} className={styles.LoadingIcon} />}
      {label}
    </Action>
  );
};
