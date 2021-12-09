import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties, Connectors } from '.';


const getWeb3 = (web3 = {}) => ({
  setConnector: () => undefined,
  active: false,
  ...(web3 || {}),
});

describe('Web3Connect', () => {
  const subject = (props: Partial<Properties> = {}, child = <div />) => {
    const allProps: Properties = {
      ...props,
      web3: getWeb3(props.web3),
      providerService: {
        register: () => undefined,
        ...(props.providerService || {}),
      },
    };

    return shallow(<Container {...allProps}>{child}</ Container>);
  };

  test('it sets infura connector on mount', () => {
    const setConnector = jest.fn();

    subject({ web3: { setConnector } });

    expect(setConnector).toHaveBeenCalledWith(Connectors.Infura);
  });

  test('it registers provider when active is true', () => {
    const library = { networkId: 3 };
    const register = jest.fn();

    const component = subject({
        providerService: { register },
        web3: { active: false },
      },
      <div className='the-cat-parade' />,
    );

    component.setProps({ web3: getWeb3({ library, active: true }) });

    expect(register).toHaveBeenCalledWith(library);
  });

  test('it renders children when active is true', () => {
    const component = subject({ web3: { active: true } }, <div className='the-cat-parade' />);

    expect(component.hasClass('the-cat-parade')).toBe(true);
  });

  test('it does not render children when active is false', () => {
    const component = subject({ web3: { active: false } }, <div className='the-cat-parade' />);

    expect(component.isEmptyRender()).toBe(true);
  });
});
