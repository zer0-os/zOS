import moment from 'moment';

import { Message as MessageModel } from '../../store/messages';
import { createMessageGroups, getMessageRenderProps } from './utils';

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

describe(getMessageRenderProps, () => {
  describe('showTimestamp', () => {
    it('is true if the message is the last in the group', () => {
      const index = 4;
      const groupLength = 5;

      const props = getProps({ index, groupLength });

      expect(props.showTimestamp).toEqual(true);
    });

    it('is false if the message is _not_ the last in the group', () => {
      const index = 2;
      const groupLength = 5;

      const props = getProps({ index, groupLength });

      expect(props.showTimestamp).toEqual(false);
    });
  });

  describe('showAuthorName', () => {
    it('is true if the message is the first in the group', () => {
      const index = 0;
      const groupLength = 5;

      const props = getProps({ index, groupLength });

      expect(props.showAuthorName).toEqual(true);
    });

    it('is false if the message is _not_ the first in the group', () => {
      const index = 2;
      const groupLength = 5;

      const props = getProps({ index, groupLength });

      expect(props.showAuthorName).toEqual(false);
    });

    it('is false if the message is in a one on one chat', () => {
      const index = 0;
      const groupLength = 5;

      const props = getProps({ index, groupLength, isOneOnOne: true });

      expect(props.showAuthorName).toEqual(false);
    });

    it('is false if the current owner is the sender', () => {
      const index = 0;
      const groupLength = 5;

      const props = getProps({ index, groupLength, isOwner: true });

      expect(props.showAuthorName).toEqual(false);
    });
  });

  function getProps({
    index,
    groupLength,
    isOneOnOne = false,
    isOwner = false,
  }: {
    index: number;
    groupLength: number;
    isOneOnOne?: boolean;
    isOwner?: boolean;
  }) {
    return getMessageRenderProps(index, groupLength, isOneOnOne, isOwner);
  }
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
