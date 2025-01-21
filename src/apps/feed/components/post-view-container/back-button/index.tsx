import { useHistory, useRouteMatch } from 'react-router-dom';
import { IconArrowLeft } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

interface BackButtonProps {
  backToId?: string;
}

export const BackButton = ({ backToId }: BackButtonProps) => {
  const history = useHistory();
  const route = useRouteMatch();

  const handleOnClick = () => {
    const params = route.params;
    const { conversationId, zid } = params;

    if (history.length > 1) {
      history.goBack();
      return;
    }

    if (backToId) {
      if (conversationId) {
        history.push(`/conversation/${conversationId}/${backToId}`);
      } else if (zid) {
        history.push(`/feed/${zid}/${backToId}`);
      }
    } else {
      if (conversationId) {
        history.push(`/conversation/${conversationId}`);
      } else if (zid) {
        history.push(`/feed/${zid}`);
      }
    }
  };

  return (
    <button className={styles.Back} onClick={handleOnClick}>
      <IconArrowLeft size={18} isFilled={false} /> Back
    </button>
  );
};
