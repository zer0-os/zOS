import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from '.';

import { Chains, ConnectionStatus, Connectors } from '../../lib/web3';
import { RootState } from '../../store/reducer';

const getWeb3 = (web3 = {}) => ({
  activate: () => undefined,
  account: '',
  chainId: undefined,
  active: false,
  library: null,
  connector: null,
  ...(web3 || {}),
});

describe('Web3Connect', () => {
  beforeAll(() => {
    global.localStorage = {
      state: {
        'access-token': '',
      },
      setItem(key, item) {
        this.state[key] = item;
      },
      getItem(key) {
        return this.state[key];
      },
      removeItem(key) {
        this.state[key] = false;
      },
      length: 0,
      clear: () => {},
      key: (_) => '',
    };
  });

  const subject = (props: Partial<Properties> = {}, child = <div />) => {
    const allProps: Properties = {
      connectors: { get: async () => undefined },
      currentConnector: Connectors.None,
      connectionStatus: ConnectionStatus.Disconnected,
      setConnectionStatus: () => undefined,
      setAddress: () => undefined,
      setChain: () => undefined,
      updateConnector: () => undefined,
      setConnectionError: () => undefined,
      ...props,
      web3: getWeb3(props.web3),
      providerService: {
        register: () => undefined,
        ...(props.providerService || {}),
      },
    };

    return shallow(<Container {...allProps}>{child}</Container>);
  };

  it('calls updateConnector with Infura on mount', () => {
    const updateConnector = jest.fn();

    subject({ updateConnector });

    expect(updateConnector).toHaveBeenCalledWith(Connectors.Infura);
  });

  it('sets chain when chain changes', () => {
    const setChain = jest.fn();

    const wrapper = subject({ setChain });

    wrapper.setProps({ web3: getWeb3({ chainId: Chains.Goerli }) });

    expect(setChain).toHaveBeenCalledWith(Chains.Goerli);
  });

  it('does not set chain when chain does not change', () => {
    const setChain = jest.fn();

    const wrapper = subject({ setChain });

    wrapper.setProps({
      web3: getWeb3({ account: '0x0000000000000000000000000000000000000009', chainId: Chains.Goerli }),
    });
    wrapper.setProps({
      web3: getWeb3({ account: '0x0000000000000000000000000000000000000033', chainId: Chains.Goerli }),
    });

    expect(setChain).toHaveBeenCalledTimes(1);
  });

  it('does not set chain when chain has not been set', () => {
    const setChain = jest.fn();

    const wrapper = subject({ setChain });

    wrapper.setProps({ web3: getWeb3({ active: true }) });

    expect(setChain).toHaveBeenCalledTimes(0);
  });

  it('sets chain if chain is null', () => {
    const setChain = jest.fn();

    const wrapper = subject({ web3: getWeb3({ chainId: Chains.Goerli }), setChain });

    wrapper.setProps({ web3: getWeb3({ chainId: null }) });

    expect(setChain).toHaveBeenCalledWith(null);
  });

  it('sets chain if chain is undefined', () => {
    const setChain = jest.fn();

    const wrapper = subject({ web3: getWeb3({ chainId: Chains.Goerli }), setChain });

    wrapper.setProps({ web3: getWeb3({ chainId: undefined }) });

    expect(setChain).toHaveBeenCalledWith(undefined);
  });

  it('activates new connector when connector changes', () => {
    const activate = jest.fn();
    const connector = { what: 'connector' };

    const web3Connect = subject({
      connectors: {
        get: jest.fn((c: Connectors) => (c === Connectors.Coinbase ? connector : null)),
      },
      web3: { activate } as any,
      currentConnector: Connectors.Infura,
    });

    web3Connect.setProps({ currentConnector: Connectors.Coinbase });

    expect(activate).toHaveBeenCalledWith(connector, null, true);
  });

  it('deactivates old connector when connector changes', () => {
    const deactivate = jest.fn();
    const connector = { what: 'connector' };

    const web3Connect = subject({
      connectors: { get: () => connector },
      web3: { activate: () => undefined, connector: { deactivate } } as any,
      currentConnector: Connectors.Infura,
    });

    web3Connect.setProps({ currentConnector: Connectors.Coinbase });

    expect(deactivate).toHaveBeenCalledOnce();
  });

  it('registers provider once when active is true', () => {
    const library = { networkId: Chains.Ropsten };
    const register = jest.fn();

    const component = subject(
      {
        providerService: { register },
        web3: { library, active: false } as any,
      },
      <div className='the-cat-parade' />
    );

    expect(register).toHaveBeenCalledTimes(0);

    component.setProps({ web3: getWeb3({ library, active: true }) });

    expect(register).toHaveBeenCalledWith(library);
    expect(register).toHaveBeenCalledOnce();
  });

  it('registers provider when library updates and active is true', () => {
    const library = { connection: { what: 'hey' } };
    const register = jest.fn();

    const component = subject(
      {
        providerService: { register },
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />
    );

    component.setProps({
      web3: getWeb3({
        library: { connection: { what: 'helloooo' } },
        active: true,
      }),
    });

    component.setProps({ web3: getWeb3({ library, active: true }) });

    expect(register).toHaveBeenCalledWith(library);
  });

  it('does not register provider when library updates and active is not true', () => {
    const library = { connection: { what: 'hey' } };
    const register = jest.fn();

    const component = subject(
      {
        providerService: { register },
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />
    );

    component.setProps({
      web3: getWeb3({
        library: { connection: { what: 'helloooo' } },
        active: false,
      }),
    });

    component.setProps({ web3: getWeb3({ library, active: false }) });

    expect(register).toHaveBeenCalledTimes(0);
  });

  it('registers provider once when active becomes true', () => {
    const library = { connection: { what: 'hey' } };
    const register = jest.fn();

    const component = subject(
      {
        providerService: { register },
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />
    );

    component.setProps({
      web3: getWeb3({
        library: { connection: { what: 'helloooo' } },
        active: false,
      }),
    });
    component.setProps({ web3: getWeb3({ library, active: false }) });
    component.setProps({ web3: getWeb3({ library, active: true }) });

    expect(register).toHaveBeenCalledWith(library);
    expect(register).toHaveBeenCalledOnce();
  });

  it('sets connection status to connected when active is true', () => {
    const library = { networkId: Chains.Ropsten };
    const setConnectionStatus = jest.fn();

    const component = subject(
      {
        setConnectionStatus,
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />
    );

    component.setProps({ web3: getWeb3({ library, active: true }) });

    expect(setConnectionStatus).toHaveBeenCalledWith(ConnectionStatus.Connected);
  });

  it('should set connection status to Disconnected when activate fail', () => {
    const setConnectionStatus = jest.fn();
    const updateConnector = jest.fn();

    const web3 = {
      activate: () => {},
    } as any;

    jest.spyOn(web3, 'activate').mockImplementation(() => {
      throw new Error();
    });

    const web3Connect = subject({
      setConnectionStatus,
      updateConnector,
      web3,
      currentConnector: Connectors.Infura,
    });

    web3Connect.setProps({ currentConnector: Connectors.Coinbase });

    expect(setConnectionStatus).toHaveBeenCalledWith(ConnectionStatus.Disconnected);
    expect(updateConnector).toHaveBeenCalledWith(Connectors.None);
  });

  it('does not set address if address is empty string', () => {
    const setAddress = jest.fn();
    const address = '';

    const component = subject(
      {
        setAddress,
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />
    );

    component.setProps({ web3: getWeb3({ account: address, active: true }) });

    expect(setAddress).toHaveBeenCalledTimes(0);
  });

  it('sets address when active is true', () => {
    const setAddress = jest.fn();
    const address = '0x0000000000000000000000000000000000000009';

    const component = subject(
      {
        setAddress,
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />
    );

    component.setProps({ web3: getWeb3({ account: address, active: true }) });

    expect(setAddress).toHaveBeenCalledWith(address);
  });

  it('renders children when connectionStatus is Connected', () => {
    const component = subject({ connectionStatus: ConnectionStatus.Connected }, <div className='the-cat-parade' />);

    expect(component.hasClass('the-cat-parade')).toBe(true);
  });

  it('does not render children when connectionStatus is Disconnected', () => {
    const component = subject({ connectionStatus: ConnectionStatus.Disconnected }, <div className='the-cat-parade' />);

    expect(component.isEmptyRender()).toBe(true);
  });

  it('does not render children when connectionStatus is Connecting', () => {
    const component = subject({ connectionStatus: ConnectionStatus.Connecting }, <div className='the-cat-parade' />);

    expect(component.isEmptyRender()).toBe(true);
  });

  it('does render children when connectionStatus is Connecting and has been connected', () => {
    const component = subject(
      {
        connectionStatus: ConnectionStatus.Disconnected,
        web3: getWeb3({
          active: false,
        }),
      },
      <div className='the-cat-parade' />
    );

    // initial connection is made
    component.setProps({
      connectionStatus: ConnectionStatus.Connecting,
      // shouldn't strictly be needed since rendering should be based on
      // connection status not web3 library, but keeping it in sync for clarity.
      web3: getWeb3({ active: true }),
    });
    component.setProps({ connectionStatus: ConnectionStatus.Connected });

    // new connection initiated
    component.setProps({ connectionStatus: ConnectionStatus.Connecting });

    expect(component.hasClass('the-cat-parade')).toBe(true);
  });

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState(state);
    const getState = (state: any = {}) =>
      ({
        ...state,
        web3: {
          status: ConnectionStatus.Connecting,
          value: { connector: Connectors.Infura },
          ...(state.web3 || {}),
        },
      } as RootState);

    test('status', () => {
      const state = subject(getState({ web3: { status: ConnectionStatus.Connected } }));

      expect(state.connectionStatus).toEqual(ConnectionStatus.Connected);
    });

    test('currentConnector', () => {
      const state = subject(getState({ web3: { value: { connector: Connectors.Coinbase } } }));

      expect(state.currentConnector).toEqual(Connectors.Coinbase);
    });
  });

  describe('Network change', () => {
    it('should change network', async () => {
      const updateConnector = jest.fn();
      const register = jest.fn();
      const activate = jest.fn();
      const library = { networkId: Chains.Kovan };
      const connector = { what: 'connector' };
      const component = subject({
        connectors: {
          get: jest.fn((c: Connectors) => (c === Connectors.Metamask ? connector : null)),
        },
        updateConnector,
      });

      component.setProps({
        providerService: { register },
        currentConnector: Connectors.Metamask,
        web3: { activate, chainId: Chains.MainNet, active: true, library } as any,
      });

      expect(activate).toHaveBeenCalledWith(connector, null, true);
      expect(register).toHaveBeenCalledWith(library);
    });
  });

  describe('reconnect connectors', () => {
    it('should call deactivateConnector when wallet is disconnected', async () => {
      const updateConnector = jest.fn();
      const setConnectionStatus = jest.fn();
      const setAddress = jest.fn();
      const activate = jest.fn();
      const address = '0x0000000000000000000000000000000000000009';
      const connector = { what: 'connector' };
      const component = subject({
        connectors: { get: () => connector },
        currentConnector: Connectors.Metamask,
        web3: { activate, chainId: Chains.MainNet, active: true, account: address } as any,
        setAddress,
        setConnectionStatus,
        updateConnector,
      });

      component.setProps({
        web3: { account: '', active: false, library: null } as any,
      });

      expect(updateConnector).toHaveBeenCalledWith(Connectors.Infura);
      expect(global.localStorage.getItem('previousConnector')).toBe(false);
    });

    it('should maintain connected state with call localStorage', async () => {
      const updateConnector = jest.fn();
      const setConnectionStatus = jest.fn();
      const setAddress = jest.fn();
      const activate = jest.fn();
      const connector = { what: 'connector' };
      const component = subject({
        connectors: {
          get: jest.fn((c: Connectors) => (c === Connectors.Metamask ? connector : null)),
        },
        currentConnector: Connectors.Infura,
        connectionStatus: ConnectionStatus.Disconnected,
        web3: { activate, chainId: Chains.MainNet, active: true } as any,
        setAddress,
        setConnectionStatus,
        updateConnector,
      });

      component.setProps({ currentConnector: Connectors.Metamask, connectionStatus: ConnectionStatus.Connected });

      expect(activate).toHaveBeenCalledWith(connector, null, true);

      component.setProps({ connectionStatus: ConnectionStatus.Disconnected });
      component.setProps({ currentConnector: Connectors.Infura, connectionStatus: ConnectionStatus.Connected });

      expect(updateConnector).toHaveBeenCalledWith(Connectors.Metamask);
    });
  });
});
