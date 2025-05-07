import { MessageWithoutSender, SagaActionTypes } from '.';
import { Events } from '../chat/bus';

export type ReceiveNewMessageAction = {
  type: Events.MessageReceived;
  payload: {
    channelId: string;
    message: MessageWithoutSender;
  };
};

export type ReceiveOptimisticMessageAction = {
  type: Events.OptimisticMessageUpdated;
  payload: {
    message: MessageWithoutSender;
    roomId: string;
  };
};

export type SyncMessagesAction = {
  type: SagaActionTypes.SyncMessages;
  payload: {
    channelId: string;
  };
};
