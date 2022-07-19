import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './zns-route-connect';
import { Main } from './Main';
import { Web3Connect } from './components/web3-connect';
import { RouteApp } from './store/zns';

describe('ZnsRouteConnect', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      setRoute: () => undefined,
      setSelectedApp: () => undefined,
      ...props,
      match: {
        params: { znsRoute: '' },
        ...(props.match || {}),
      },
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders Main component as child of Web3Connect', () => {
    const container = subject();

    const web3Connect = container.find(Main).closest(Web3Connect);

    expect(web3Connect.exists()).toBe(true);
  });

  it('sets route when mounted', () => {
    const setRoute = jest.fn();
    const znsRoute: string = 'icecream.shop';
    const routeApp: RouteApp = { route: znsRoute, hasAppChanged: false };

    subject({ setRoute, match: { params: { znsRoute } } });

    expect(setRoute).toHaveBeenCalledWith(routeApp);
  });

  it('sets route when updated', () => {
    const setRoute = jest.fn();
    const znsRoute: string = 'icecream.flavors.pickle';
    const routeApp: RouteApp = { route: znsRoute, hasAppChanged: false };

    const container = subject({
      setRoute,
      match: { params: { znsRoute: 'icecream.shop' } },
    });

    container.setProps({
      match: { params: { znsRoute } },
    });

    expect(setRoute).toHaveBeenNthCalledWith(2, routeApp);
  });

  it('sets app when mounted', () => {
    const setSelectedApp = jest.fn();

    subject({ setSelectedApp, match: { params: { app: 'mIRC 2.1a' } } });

    expect(setSelectedApp).toHaveBeenCalledWith('mIRC 2.1a');
  });

  it('sets app when updated', () => {
    const setSelectedApp = jest.fn();

    const container = subject({
      setSelectedApp,
      match: { params: { app: 'mIRC 2.1a' } },
    });

    container.setProps({ match: { params: { app: 'ICQ 99a' } } });

    expect(setSelectedApp).toHaveBeenNthCalledWith(2, 'ICQ 99a');
  });

  it('sets DeepestVisitedRoute when switching apps', () => {
    const setRoute = jest.fn();
    const znsRoute: string = 'icecream.flavors.pickle';
    const app: string = 'ICQ 99a';
    const routeApp: RouteApp = { route: znsRoute, hasAppChanged: true };

    const container = subject({
      setRoute,
      match: { params: { app: 'mIRC 2.1a', znsRoute: 'icecream.shop' } },
    });

    container.setProps({ match: { params: { app, znsRoute } } });

    expect(setRoute).toHaveBeenCalledWith(routeApp);
  });
});
