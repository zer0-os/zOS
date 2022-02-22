import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './zns-route-connect';
import { Main } from './Main';
import { Web3Connect } from './components/web3-connect';

describe('ZnsRouteConnect', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      setRoute: () => undefined,
      ...props,
      match: {
        params: { znsRoute: '' },
        ...(props.match || {}),
      },
    };
    
    return shallow(<Container {...allProps} />);
  };

  it('renders Main component as child of Web3Connect', () => {
    const setRoute = jest.fn();

    const container = subject();

    const web3Connect = container.find(Main).closest(Web3Connect);

    expect(web3Connect.exists()).toBe(true);
  });

  it('sets route when mounted', () => {
    const setRoute = jest.fn();

    subject({ setRoute, match: { params: { znsRoute: 'icecream.shop' } } });

    expect(setRoute).toHaveBeenCalledWith('icecream.shop');
  });

  it('sets route when updated', () => {
    const setRoute = jest.fn();

    const container = subject({ setRoute, match: { params: { znsRoute: 'icecream.shop' } } });

    container.setProps({ match: { params: { znsRoute: 'icecream.flavors.pickle' } } });

    expect(setRoute).toHaveBeenNthCalledWith(2, 'icecream.flavors.pickle');
  });
});
