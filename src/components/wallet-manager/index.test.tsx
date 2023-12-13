import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store/reducer';

import { ConnectionStatus, Connectors } from '../../lib/web3';
import { Container } from '.';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { Button as ConnectButton } from '../../components/authentication/button';
import { UserActionsContainer } from '../user-actions/container';
import { WalletType } from '../wallet-select/wallets';

describe('WalletManager', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      loginByWeb3: () => undefined,
      logout: () => undefined,
      setWalletModalOpen: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders connect button', () => {
    const wrapper = subject();

    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ hideChildren: true });

    expect(ifAuthenticated.find(ConnectButton).exists()).toBe(true);
  });

  it('adds className', () => {
    const wrapper = subject({ className: 'tacos' });

    const component = wrapper.find('.wallet-manager');

    expect(component.hasClass('tacos')).toBe(true);
  });

  // this will be currentWallet dependent in the future, but at the moment we only support
  // metamask
  it('does not render connect button if Metamask is connected', () => {
    const wrapper = subject();

    wrapper.setProps({
      connectionStatus: ConnectionStatus.Connected,
      currentConnector: Connectors.Metamask,
      isAuthenticated: true,
    });

    expect(wrapper.find('Button').exists()).toBe(false);
  });

  it('renders user actions when set', () => {
    const currentAddress = '0x0000000000000000000000000000000000000001';

    const wrapper = subject({
      currentAddress,
      userIsOnline: true,
      userImageUrl: 'image-url',
    });
    const ifAuthenticated = wrapper.find(IfAuthenticated).find({ showChildren: true });

    expect(ifAuthenticated.find(UserActionsContainer).props()).toEqual(
      expect.objectContaining({
        userAddress: currentAddress,
        userImageUrl: 'image-url',
        userIsOnline: true,
      })
    );
  });

  it('calls logout when disconnect occurs', () => {
    const logout = jest.fn();
    const currentAddress = '0x0000000000000000000000000000000000000001';

    const wrapper = subject({ logout, currentAddress });

    wrapper.find(UserActionsContainer).simulate('disconnect');

    expect(logout).toHaveBeenCalled();
    expect(wrapper.find(ConnectButton).exists()).toBe(true);
  });

  it('does not render wallet select modal', () => {
    const wrapper = subject();

    expect(wrapper.find('WalletSelectModal').exists()).toBe(false);
  });

  it('should render all available wallets', () => {
    const wrapper = subject({ isWalletModalOpen: true });

    expect(wrapper.find('WalletSelectModal').prop('wallets')).toStrictEqual([
      WalletType.Metamask,
      WalletType.WalletConnect,
      WalletType.Coinbase,
      WalletType.Fortmatic,
      WalletType.Portis,
    ]);
  });

  it('passes isConnecting to wallet modal', () => {
    const wrapper = subject({ isConnecting: true, isWalletModalOpen: true });

    expect(wrapper.find('WalletSelectModal').prop('isConnecting')).toBe(true);
  });

  it('closes wallet select modal onClose', () => {
    const setWalletModalOpen = jest.fn();
    const wrapper = subject({ isWalletModalOpen: true, setWalletModalOpen });

    wrapper.find('WalletSelectModal').simulate('close');

    expect(setWalletModalOpen).toHaveBeenCalledWith(false);
  });

  it('calls login when wallet selected', () => {
    const loginByWeb3 = jest.fn();

    const wrapper = subject({ loginByWeb3, isWalletModalOpen: true });

    wrapper.find('WalletSelectModal').simulate('select', Connectors.Metamask);

    expect(loginByWeb3).toHaveBeenCalledWith(Connectors.Metamask);
  });

  it('passes isNotSupportedNetwork of true when network is not supported', () => {
    const wrapper = subject({ isWalletModalOpen: true });

    wrapper.setProps({
      connectionStatus: ConnectionStatus.NetworkNotSupported,
    });

    expect(wrapper.find('WalletSelectModal').prop('isNotSupportedNetwork')).toBe(true);
  });

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState(state);
    const getState = (state: any = {}) =>
      ({
        ...state,
        web3: getWeb3({
          ...(state.web3 || {}),
        }),
        authentication: getAuthentication({
          ...(state.authentication || {}),
        }),
        login: {},
      } as RootState);

    const getWeb3 = (web3: any = {}) => ({
      status: ConnectionStatus.Disconnected,
      ...(web3 || {}),
      value: {
        address: '0x0',
        connector: Connectors.None,
        ...(web3.value || {}),
      },
    });

    const getAuthentication = (authentication: any = {}) => ({
      user: {
        isLoading: false,
        data: null,
      },
      ...(authentication || {}),
    });

    test('status', () => {
      const state = subject(getState({ web3: getWeb3({ status: ConnectionStatus.Connected }) }));

      expect(state.connectionStatus).toEqual(ConnectionStatus.Connected);
    });

    test('currentAddress', () => {
      const address = '0x0000000000000000000000000000000000000002';

      const state = subject(getState({ web3: getWeb3({ value: { address } }) }));

      expect(state.currentAddress).toEqual(address);
    });

    test('isNotSupportedNetwork', () => {
      const connectionStatus = ConnectionStatus.NetworkNotSupported;

      const state = subject(getState({ web3: getWeb3({ status: connectionStatus }) }));

      expect(state.connectionStatus).toEqual(connectionStatus);
    });

    test('isWalletModalOpen', () => {
      const isWalletModalOpenMock = true;
      const state = subject(getState({ web3: getWeb3({ isWalletModalOpen: isWalletModalOpenMock }) }));

      expect(state.isWalletModalOpen).toEqual(isWalletModalOpenMock);
    });

    test('userImageUrl', () => {
      const state = subject(
        getState({
          authentication: {
            user: {
              data: {
                id: 'user-id',
                profileSummary: {
                  profileImage: 'user-url',
                },
              },
            },
          },
        })
      );

      expect(state.userImageUrl).toEqual('user-url');
    });

    test('userImageUrl', () => {
      const state = subject(
        getState({
          authentication: {
            user: { data: { profileSummary: { profileImage: 'user-url' } } },
          },
        })
      );

      expect(state.userImageUrl).toEqual('user-url');
    });

    test('userIsOnline', () => {
      const state = subject(
        getState({
          authentication: {
            user: { data: { isOnline: true } },
          },
        })
      );

      expect(state.userIsOnline).toEqual(true);
    });
  });
});
