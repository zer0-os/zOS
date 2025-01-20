import { useArweaveAction } from './useArweaveAction';

import { IconLinkExternal1 } from '@zero-tech/zui/components/Icons';
import { Action } from '@zero-tech/zui/components/Post';

import styles from './styles.module.scss';

export interface ArweaveActionProps {
  arweaveId: string;
}

export const ArweaveAction = ({ arweaveId }: ArweaveActionProps) => {
  const { handleOnClick } = useArweaveAction(arweaveId);

  return (
    <Action className={styles.Container} onClick={handleOnClick}>
      <IconLinkExternal1 size={16} />
    </Action>
  );
};
