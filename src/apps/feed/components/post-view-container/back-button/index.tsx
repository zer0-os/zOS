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
    const { conversationId } = params;

    if (backToId) {
      history.push(`/conversation/${conversationId}/${backToId}`);
    } else {
      history.push(`/conversation/${conversationId}`);
    }
  };

  return (
    <button className={styles.Back} onClick={handleOnClick}>
      <IconArrowLeft size={16} isFilled={true} /> Back
    </button>
  );
};
