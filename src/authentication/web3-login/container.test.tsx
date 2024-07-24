import { ConnectionStatus } from '../../lib/web3';
import { Container, Web3LoginContainerProperties } from './container';
import { shallow } from 'enzyme';

describe('Web3LoginContainer', () => {
  const subject = (props: Partial<Web3LoginContainerProperties>) => {
    const allProps: Web3LoginContainerProperties = {
      error: '',
      isConnecting: false,
      loginByWeb3: () => null,
      isWalletConnected: false,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  describe('mapState', () => {
    it('should map state to props', () => {
      const state = {
        login: { loading: true, errors: ['error'] },
        web3: { status: ConnectionStatus.Connected },
      };

      const props = Container.mapState(state as any);

      expect(props).toEqual({ error: 'error', isConnecting: true, isWalletConnected: true });
    });
  });

  describe('mapActions', () => {
    it('should map actions to props', () => {
      const props = Container.mapActions({} as any);

      expect(props).toHaveProperty('loginByWeb3');
    });
  });

  it('should pass props to Web3Login', () => {
    const wrapper = subject({ error: 'error', isConnecting: true });

    const web3Login = wrapper.find('Web3Login');
    expect(web3Login.props()).toEqual(expect.objectContaining({ error: 'error', isConnecting: true }));
  });
});
