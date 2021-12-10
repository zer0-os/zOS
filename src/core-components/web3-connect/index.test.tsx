import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties, Connectors } from '.';


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

  test('it renders children when active is true', () => {
    const component = subject({ web3: { active: true } as any }, <div className='the-cat-parade' />);

    expect(component.hasClass('the-cat-parade')).toBe(true);
  });

  test('it does not render children when active is false', () => {
    const component = subject({ web3: { active: false } as any }, <div className='the-cat-parade' />);

    expect(component.isEmptyRender()).toBe(true);
  });
});
