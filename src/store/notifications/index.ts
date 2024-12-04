import { createAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  OpenNotificationConversation = 'notifications/saga/openNotificationConversation',
}

export const openNotificationConversation = createAction<string>(SagaActionTypes.OpenNotificationConversation);
