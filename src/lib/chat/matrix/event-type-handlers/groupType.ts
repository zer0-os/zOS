import { CustomEventType } from '../types';
import { call } from 'redux-saga/effects';
import { receiveChannel } from '../../../../store/channels/saga';

export type GroupTypeEvent = {
  type: CustomEventType.GROUP_TYPE;
  content: {
    group_type: string;
  };
};

export const isGroupTypeEvent = (event: unknown): event is GroupTypeEvent => {
  return typeof event === 'object' && event !== null && 'type' in event && event.type === CustomEventType.GROUP_TYPE;
};

export function* handleGroupTypeEvent(event: GroupTypeEvent, roomId: string) {
  const groupType = event.content?.group_type;
  if (groupType && groupType === 'social') {
    yield call(receiveChannel, { id: roomId, isSocialChannel: true });
  }
}
