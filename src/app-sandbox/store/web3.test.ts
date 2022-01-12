import {
  reducer,
  setConnectionStatus,
  setAddress,
  Web3State,
} from './web3';
import { ConnectionStatus } from '../../lib/web3';

describe('web3 reducer', () => {
  const initialExistingState: Web3State = {
    status: ConnectionStatus.Disconnected,
    value: { address: '' },
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      status: ConnectionStatus.Disconnected,
      value: { address: '' },
    });
  });

  it('should replace existing state with new status', () => {
    const actual = reducer(initialExistingState, setConnectionStatus(ConnectionStatus.Connected));

    expect(actual.status).toEqual(ConnectionStatus.Connected);
  });

  it('should replace existing state with new address', () => {
    const actual = reducer(initialExistingState, setAddress('0x0000000000000000000000000000000000000007'));

    expect(actual.value.address).toEqual('0x0000000000000000000000000000000000000007');
  });
});
