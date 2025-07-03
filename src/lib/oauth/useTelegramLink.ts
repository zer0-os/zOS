import { config } from '../../config';
import { useDispatch, useSelector } from 'react-redux';
import { openConversation } from '../../store/channels';
import { isOneOnOne } from '../../store/channels-list/utils';
import { allChannelsSelector } from '../../store/channels/selectors';
import { createConversation } from '../../store/create-conversation';

export const useTelegramLink = () => {
  const dispatch = useDispatch();
  const conversations = useSelector(allChannelsSelector);
  const telegramBotUserId = config.telegramBotUserId;

  const onTelegramLink = (conversations, telegramBotUserId) => {
    const existingConversation = conversations?.find(
      (conversation) => isOneOnOne(conversation) && conversation.otherMembers[0] === telegramBotUserId
    );

    if (existingConversation) {
      dispatch(openConversation({ conversationId: existingConversation.id }));
    } else {
      dispatch(createConversation({ userIds: [telegramBotUserId] }));
    }
  };

  return () => onTelegramLink(conversations, telegramBotUserId);
};
