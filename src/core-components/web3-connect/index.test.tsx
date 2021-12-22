import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from '.';

import { ConnectionStatus, Connectors } from '../../lib/web3';
import {RootState} from '../../store';

const getWeb3 = (web3 = {}) => ({
  activate: (connector: any) => undefined,
  active: false,
  library: null,
  ...(web3 || {}),
});

describe('Web3Connect', () => {
  const subject = (props: Partial<Properties> = {}, child = <div />) => {
    const allProps: Properties = {
      connectors: { get: async () => undefined },
      connectionStatus: ConnectionStatus.Disconnected,
      setConnectionStatus: () => undefined,
      ...props,
      web3: getWeb3(props.web3),
      providerService: {
        register: () => undefined,
        ...(props.providerService || {}),
      },
    };

    return shallow(<Container {...allProps}>{child}</ Container>);
  };

  test('it activates infura connector on mount', () => {
    const activate = jest.fn();
    const connector = { what: 'connector' };

    subject({
      connectors: {
        get: jest.fn((c: Connectors) => c === Connectors.Infura ? connector : null),
      },
      web3: { activate } as any,
    });

    expect(activate).toHaveBeenCalledWith(connector);
  });

  test('it registers provider when active is true', () => {
    const library = { networkId: 3 };
    const register = jest.fn();

    const component = subject({
        providerService: { register },
        web3: { active: false } as any,
      },
      <div className='the-cat-parade' />,
    );

    component.setProps({ web3: getWeb3({ library, active: true }) });

    expect(register).toHaveBeenCalledWith(library);
  });

  test('it sets connection status to connected when active is true', () => {
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

  test('it renders children when connectionStatus is Connected', () => {
    const component = subject({ connectionStatus: ConnectionStatus.Connected }, <div className='the-cat-parade' />);

    expect(component.hasClass('the-cat-parade')).toBe(true);
  });

  test('it does not render children when connectionStatus is Disconnected', () => {
    const component = subject({ connectionStatus: ConnectionStatus.Disconnected }, <div className='the-cat-parade' />);

    expect(component.isEmptyRender()).toBe(true);
  });

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState(state);

    test('status', () => {
      const state = subject({ web3: { status: ConnectionStatus.Connected } } as RootState);

      expect(state.connectionStatus).toEqual(ConnectionStatus.Connected);
    });
  });
});
