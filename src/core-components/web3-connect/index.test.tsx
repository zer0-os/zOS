import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from '.';

import { ConnectionStatus, Connectors } from '../../lib/web3';
import {RootState} from '../../store';

const getWeb3 = (web3 = {}) => ({
  activate: (connector: any) => undefined,
  active: false,
  library: null,
  connector: null,
  ...(web3 || {}),
});

describe('Web3Connect', () => {
  const subject = (props: Partial<Properties> = {}, child = <div />) => {
    const allProps: Properties = {
      connectors: { get: async () => undefined },
      currentConnector: Connectors.None,
      connectionStatus: ConnectionStatus.Disconnected,
      setConnectionStatus: () => undefined,
      updateConnector: () => undefined,
      ...props,
      web3: getWeb3(props.web3),
      providerService: {
        register: () => undefined,
        ...(props.providerService || {}),
      },
    };

    return shallow(<Container {...allProps}>{child}</ Container>);
  };

  it('calls updateConnector with Infura on mount', () => {
    const updateConnector = jest.fn();

    subject({ updateConnector });

    expect(updateConnector).toHaveBeenCalledWith(Connectors.Infura);
  });

  it('activates new connector when connector changes', () => {
    const activate = jest.fn();
    const connector = { what: 'connector' };

    const web3Connect = subject({
      connectors: {
        get: jest.fn((c: Connectors) => c === Connectors.Portis ? connector : null),
      },
      web3: { activate } as any,
      currentConnector: Connectors.Infura,
    });

    web3Connect.setProps({ currentConnector: Connectors.Portis });

    expect(activate).toHaveBeenCalledWith(connector);
  });

  it('deactivates old connector when connector changes', () => {
    const deactivate = jest.fn();
    const connector = { what: 'connector' };

    const web3Connect = subject({
      connectors: { get: () => connector },
      web3: { activate: () => undefined, connector: { deactivate } } as any,
      currentConnector: Connectors.Infura,
    });

    web3Connect.setProps({ currentConnector: Connectors.Portis });

    expect(deactivate).toHaveBeenCalledOnce();
  });

  it('registers provider once when active is true', () => {
    const library = { networkId: 3 };
    const register = jest.fn();

    const component = subject({
        providerService: { register },
        web3: { library, active: false } as any,
      },
      <div className='the-cat-parade' />,
    );

    expect(register).toHaveBeenCalledTimes(0);

    component.setProps({ web3: getWeb3({ library, active: true }) });

    expect(register).toHaveBeenCalledWith(library);
    expect(register).toHaveBeenCalledOnce();
  });

  it('registers provider when library updates and active is true', () => {
    const library = { connection: { what: 'hey' } };
    const register = jest.fn();

    const component = subject({
        providerService: { register },
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />,
    );

    component.setProps({ web3: getWeb3({ library: { connection: { what: 'helloooo' } }, active: true }) });

    component.setProps({ web3: getWeb3({ library, active: true }) });

    expect(register).toHaveBeenCalledWith(library);
  });

  it('does not register provider when library updates and active is not true', () => {
    const library = { connection: { what: 'hey' } };
    const register = jest.fn();

    const component = subject({
        providerService: { register },
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />,
    );

    component.setProps({ web3: getWeb3({ library: { connection: { what: 'helloooo' } }, active: false }) });

    component.setProps({ web3: getWeb3({ library, active: false }) });

    expect(register).toHaveBeenCalledTimes(0);
  });

  it('registers provider once when active becomes true', () => {
    const library = { connection: { what: 'hey' } };
    const register = jest.fn();

    const component = subject({
        providerService: { register },
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />,
    );

    component.setProps({ web3: getWeb3({ library: { connection: { what: 'helloooo' } }, active: false }) });
    component.setProps({ web3: getWeb3({ library, active: false }) });
    component.setProps({ web3: getWeb3({ library, active: true }) });

    expect(register).toHaveBeenCalledWith(library);
    expect(register).toHaveBeenCalledOnce();
  });

  it('sets connection status to connected when active is true', () => {
    const library = { networkId: 3 };
    const setConnectionStatus = jest.fn();

    const component = subject({
        setConnectionStatus,
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />,
    );

    component.setProps({ web3: getWeb3({ library, active: true }) });

    expect(setConnectionStatus).toHaveBeenCalledWith(ConnectionStatus.Connected);
  });

  it('renders children when connectionStatus is Connected', () => {
    const component = subject({ connectionStatus: ConnectionStatus.Connected }, <div className='the-cat-parade' />);

    expect(component.hasClass('the-cat-parade')).toBe(true);
  });

  it('does not render children when connectionStatus is Disconnected', () => {
    const component = subject({ connectionStatus: ConnectionStatus.Disconnected }, <div className='the-cat-parade' />);

    expect(component.isEmptyRender()).toBe(true);
  });

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState(state);
    const getState = (state: any = {}) => ({
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
      const state = subject(getState({ web3: { value: { connector: Connectors.Fortmatic } } }));

      expect(state.currentConnector).toEqual(Connectors.Fortmatic);
    });
  });
});
