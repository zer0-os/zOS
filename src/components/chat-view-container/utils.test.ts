import moment from 'moment';

import { Message as MessageModel } from '../../store/messages';
import { createMessageGroups } from './utils';

describe(createMessageGroups, () => {
  it('returns an empty group list when input is empty', () => {
    const groups = createMessageGroups([]);

    expect(groups).toEqual([]);
  });

  it('creates separate groups for admin messages', () => {
    const firstTime = moment();
    const firstMessage = stubMessage({ isAdmin: true, createdAt: firstTime.valueOf() });
    const secondMessage = stubMessage({ isAdmin: true, createdAt: firstTime.add(1, 'minute').valueOf() });

    const groups = createMessageGroups([
      firstMessage,
      secondMessage,
    ]);

    expect(groups).toEqual([
      [firstMessage],
      [secondMessage],
    ]);
  });

  it('creates separate groups for separate senders', () => {
    const firstTime = moment();
    const firstMessage = stubMessage({ sender: stubUser({ userId: '1' }), createdAt: firstTime.valueOf() });
    const secondMessage = stubMessage({
      sender: stubUser({ userId: '2' }),
      createdAt: firstTime.add(1, 'minute').valueOf(),
    });

    const groups = createMessageGroups([
      firstMessage,
      secondMessage,
    ]);

    expect(groups).toEqual([
      [firstMessage],
      [secondMessage],
    ]);
  });

  it('groups messages within 5 minutes from the same sender', () => {
    const firstTime = moment();
    const sender = stubUser();
    const first = stubMessage({ sender, createdAt: firstTime.valueOf() });
    const second = stubMessage({ sender, createdAt: firstTime.add(1, 'minute').valueOf() });
    const third = stubMessage({ sender, createdAt: firstTime.add(7, 'minute').valueOf() });

    const groups = createMessageGroups([
      first,
      second,
      third,
    ]);

    expect(groups).toEqual([
      [
        first,
        second,
      ],
      [third],
    ]);
  });
});

function stubMessage(attrs: Partial<MessageModel> = {}) {
  return {
    id: 1,
    isAdmin: false,
    ...attrs,
  } as MessageModel;
}

function stubUser(attrs = {}) {
  return {
    userId: 'stub-user-id',
    ...attrs,
  } as MessageModel['sender'];
}
