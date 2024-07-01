import { reducer, setConnectionStatus, setConnector, setWalletAddress, setChain, Web3State } from '.';
import { Chains, ConnectionStatus } from '../../lib/web3';

describe('web3 reducer', () => {
  const initialExistingState: Web3State = {
    status: ConnectionStatus.Disconnected,
    value: { chainId: null, address: '', connectorId: undefined, error: '' },
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      status: ConnectionStatus.Disconnected,
      value: { chainId: null, address: '', connector: undefined, error: '' },
    });
  });

  it('should replace existing state with new status', () => {
    const actual = reducer(initialExistingState, setConnectionStatus(ConnectionStatus.Connected));

    expect(actual.status).toEqual(ConnectionStatus.Connected);
  });

  it('should replace existing state with new connector', () => {
    const actual = reducer(initialExistingState, setConnector('coinbase'));

    expect(actual.value.connectorId).toEqual('coinbase');
  });

  it('should replace existing state with new address', () => {
    const actual = reducer(initialExistingState, setWalletAddress('0x0000000000000000000000000000000000000007'));

    expect(actual.value.address).toEqual('0x0000000000000000000000000000000000000007');
  });

  it('should replace existing state with new chain id', () => {
    const actual = reducer(initialExistingState, setChain(Chains.Kovan));

    expect(actual.value.chainId).toEqual(Chains.Kovan);
  });
});
