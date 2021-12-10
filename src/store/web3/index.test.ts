import {
  reducer,
  setConnectionStatus,
  Web3State,
} from '.';
import { ConnectionStatus } from '../../lib/web3';

describe('web3 reducer', () => {
  const initialExistingState: Web3State = {
    status: ConnectionStatus.Disconnected,
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      status: ConnectionStatus.Disconnected,
    });
  });

  it('should replace existing state', () => {
    const actual = reducer(initialExistingState, setConnectionStatus(ConnectionStatus.Connected));

    expect(actual.status).toEqual(ConnectionStatus.Connected);
  });
});
