import { IconButton } from '@zero-tech/zui/components';
import { IconPlus } from '@zero-tech/zui/icons';
import { startCreateConversation } from '../../../../store/create-conversation';
import { useDispatch } from 'react-redux';

export const CreateConversationButton = () => {
  const dispatch = useDispatch();

  const handleOnClick = () => {
    dispatch(startCreateConversation());
  };

  return (
    <IconButton
      Icon={IconPlus}
      onClick={handleOnClick}
      aria-label='Create new conversation'
      data-testid='create-conversation-button'
    />
  );
};
