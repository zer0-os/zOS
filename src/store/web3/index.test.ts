import { reducer, setConnectionStatus, setConnector, setAddress, setChain, Web3State, setWalletModalOpen } from '.';
import { Chains, ConnectionStatus, Connectors } from '../../lib/web3';

describe('web3 reducer', () => {
  const initialExistingState: Web3State = {
    status: ConnectionStatus.Disconnected,
    value: { chainId: null, address: '', connector: Connectors.None, error: '' },
    isWalletModalOpen: false,
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      status: ConnectionStatus.Disconnected,
      value: { chainId: null, address: '', connector: Connectors.None, error: '' },
      isWalletModalOpen: false,
    });
  });

  it('should replace existing state with new status', () => {
    const actual = reducer(initialExistingState, setConnectionStatus(ConnectionStatus.Connected));

    expect(actual.status).toEqual(ConnectionStatus.Connected);
  });

  it('should replace existing state with new connector', () => {
    const actual = reducer(initialExistingState, setConnector(Connectors.Portis));

    expect(actual.value.connector).toEqual(Connectors.Portis);
  });

  it('should replace existing state with new address', () => {
    const actual = reducer(initialExistingState, setAddress('0x0000000000000000000000000000000000000007'));

    expect(actual.value.address).toEqual('0x0000000000000000000000000000000000000007');
  });

  it('should replace existing state with new chain id', () => {
    const actual = reducer(initialExistingState, setChain(Chains.Kovan));

    expect(actual.value.chainId).toEqual(Chains.Kovan);
  });

  it('should replace existing state with opening wallet', () => {
    const isOpen = true;
    const actual = reducer(initialExistingState, setWalletModalOpen(isOpen));

    expect(actual.isWalletModalOpen).toEqual(isOpen);
  });
});
