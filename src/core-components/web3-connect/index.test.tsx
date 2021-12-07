import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties, Connectors } from '.';


describe('Web3Connect', () => {
  const subject = (props: Partial<Properties> = {}, child = <div />) => {
    const allProps: Properties = {
      ...props,
      web3: {
        setConnector: () => undefined,
        active: false,
        ...(props.web3 || {}),
      },
    };

    return shallow(<Container {...allProps}>{child}</ Container>);
  };

  test('it sets infura connector on mount', () => {
    const setConnector = jest.fn();

    subject({ web3: { setConnector } });

    expect(setConnector).toHaveBeenCalledWith(Connectors.Infura);
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
