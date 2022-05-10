import {
  reducer,
  receive,
  setStatus,
  ChannelsState,
  ConnectionStatus,
} from '.';

describe('channels reducer', () => {
  const initialExistingState: ChannelsState = {
    status: ConnectionStatus.Disconnected,
    value: { account: '' },
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      status: ConnectionStatus.Disconnected,
      value: {
        account: '',
      },
    });
  });

  it('should replace existing state with new state', () => {
    const account = '0x000000000000000000000000000000000000000A';
    const status = ConnectionStatus.Connected;

    const actual = reducer(initialExistingState, receive({ status, value: { account } }));

    expect(actual).toStrictEqual({ status, value: { account } });
  });

  it('should replace existing status with new status', () => {
    const actual = reducer(initialExistingState, setStatus(ConnectionStatus.Connecting));

    expect(actual.status).toEqual(ConnectionStatus.Connecting);
  });
});
