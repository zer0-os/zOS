import { reducer, receive, setStatus, ChannelsListState, Status } from '.';

describe('channelList reducer', () => {
  const initialExistingState: ChannelsListState = {
    status: Status.Idle,
    value: { account: '' },
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      status: Status.Idle,
      value: {
        account: '',
      },
    });
  });

  it('should replace existing state with new state', () => {
    const account = '0x000000000000000000000000000000000000000A';
    const status = Status.Fetching;

    const actual = reducer(initialExistingState, receive({ status, value: { account } }));

    expect(actual).toStrictEqual({ status, value: { account } });
  });

  it('should replace existing status with new status', () => {
    const actual = reducer(initialExistingState, setStatus(Status.Fetching));

    expect(actual.status).toEqual(Status.Fetching);
  });
});
