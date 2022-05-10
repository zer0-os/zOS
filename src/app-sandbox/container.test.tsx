import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { RootState } from '../store';
import { AppSandbox } from '.';
import { Apps, PlatformApp } from '../lib/apps';
import { Chains, ConnectionStatus, Connectors } from '../lib/web3';
import { ProviderService } from '../lib/web3/provider-service';

describe('AppSandboxContainer', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      store: {} as any,
      route: '',
      address: '',
      chainId: null,
      connectionStatus: ConnectionStatus.Connected,
      providerService: { get: () => null } as ProviderService,
      selectedApp: Apps.Channels,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes store to child', () => {
    const store: any = { what: 'no' };

    const wrapper = subject({ store });

    expect(wrapper.find(AppSandbox).prop('store')).toStrictEqual(store);
  });

  it('does not render child when not connected', () => {
    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
    });

    expect(wrapper.find(AppSandbox).exists()).toBe(false);
  });

  it('renders child when connecting and has been connected', () => {
    const wrapper = subject({
      connectionStatus: ConnectionStatus.Disconnected,
    });

    wrapper.setProps({ connectionStatus: ConnectionStatus.Connecting });

    // verify initial conditions
    expect(wrapper.find(AppSandbox).exists()).toBe(false);

    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected });
    wrapper.setProps({ connectionStatus: ConnectionStatus.Connecting });

    expect(wrapper.find(AppSandbox).exists()).toBe(true);
  });

  it('passes user to sandbox', () => {
    const user = { account: '0x000000000000000000000000000000000000000A' };

    const wrapper = subject({ user });

    expect(wrapper.find(AppSandbox).prop('user')).toStrictEqual(user);
  });

  it('passes selected app to sandbox', () => {
    const selectedApp = Apps.Feed;

    const wrapper = subject({ selectedApp });

    expect(wrapper.find(AppSandbox).prop('selectedApp')).toBe(selectedApp);
  });

  it('passes route to sandbox', () => {
    const wrapper = subject({ route: 'tacos.street.pollo' });

    expect(wrapper.find(AppSandbox).prop('znsRoute')).toBe('tacos.street.pollo');
  });

  it('passes address to sandbox', () => {
    const wrapper = subject({ address: '0x0000000000000000000000000000000000000009' });

    expect(wrapper.find(AppSandbox).prop('address')).toBe('0x0000000000000000000000000000000000000009');
  });

  it('passes chainId to sandbox', () => {
    const wrapper = subject({ chainId: Chains.Morden });

    expect(wrapper.find(AppSandbox).prop('chainId')).toBe(Chains.Morden);
  });

  it('passes provider to sandbox', () => {
    const provider = { hey: 'what' };

    const wrapper = subject({
      route: 'tacos.street.pollo',
      providerService: { get: () => provider } as ProviderService,
    });

    expect(wrapper.find(AppSandbox).prop('web3Provider')).toStrictEqual(provider);
  });

  it('updates provider when connection status changes', () => {
    const oldProvider = { hey: 'what old provider' };
    const wrapper = subject({
      route: 'tacos.street.pollo',
      providerService: { get: () => oldProvider } as ProviderService,
      connectionStatus: ConnectionStatus.Connected,
    });

    const newProvider = { hey: 'what new provider' };

    wrapper.setProps({
      providerService: { get: () => newProvider } as ProviderService,
      connectionStatus: ConnectionStatus.Connecting,
    });

    // check precondition
    expect(wrapper.find(AppSandbox).prop('web3Provider')).toStrictEqual(oldProvider);

    wrapper.setProps({ connectionStatus: ConnectionStatus.Connected });

    expect(wrapper.find(AppSandbox).prop('web3Provider')).toStrictEqual(newProvider);
  });

  describe('mapState', () => {
    const subject = (state: any) =>
      Container.mapState({
        zns: { value: { route: '' }, ...(state.zns || {}) },
        web3: {
          status: ConnectionStatus.Connecting,
          ...(state.web3 || {}),
          value: {
            address: '',
            chainId: null,
            ...(state?.web3?.value || {}),
          },
        },
        apps: { selectedApp: '', ...(state.apps || {}) },
      } as any);


    test('connectionStatus', () => {
      const state = subject({ web3: { status: ConnectionStatus.Connected } as any });

      expect(state.connectionStatus).toEqual(ConnectionStatus.Connected);
    });

    test('address', () => {
      const state = subject({ web3: { value: { address: '0x0000000000000000000000000000000000000044' } } });

      expect(state.address).toEqual('0x0000000000000000000000000000000000000044');
    });

    test('chainId', () => {
      const state = subject({ web3: { value: { chainId: Chains.Rinkeby } } });

      expect(state.chainId).toEqual(Chains.Rinkeby);
    });

    test('user when connected with no account', () => {
      const state = subject({ web3: {  status: ConnectionStatus.Connected, value: { connector: Connectors.Infura } } as any });

      expect(state.user).toStrictEqual({ account: '' });
    });

    test('user with account', () => {
      const state = subject({ web3: { value: { address: '0x000000000000000000000000000000000000000A' } } as any });

      expect(state.user.account).toEqual('0x000000000000000000000000000000000000000A');
    });

    test('route', () => {
      const route = 'deep.fried.zucchini';

      const state = subject({ zns: { value: { route } } } as RootState);

      expect(state).toMatchObject({ route });
    });

    test('selectedApp', () => {
      const selectedApp = Apps.DAOS;

      const state = subject({
        apps: { selectedApp: { type: selectedApp } as PlatformApp },
      });

      expect(state).toMatchObject({ selectedApp });
    });
  });
});
