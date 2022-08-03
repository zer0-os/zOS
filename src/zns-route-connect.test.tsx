import React from 'react';
import { shallow } from 'enzyme';
import { Container } from './zns-route-connect';
import { Main } from './Main';
import { Web3Connect } from './components/web3-connect';

describe('ZnsRouteConnect', () => {
  const getMatchForParams = (params = {}) => {
    return {
      params: {
        app: 'feed',
        znsRoute: '',
        ...params,
      },
    };
  };

  const subject = (props: any = {}) => {
    const allProps = {
      setRoute: () => undefined,
      setSelectedApp: () => undefined,
      ...props,
      match: getMatchForParams(props?.match?.params),
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
    const route = 'icecream.shop';

    subject({ setRoute, match: { params: { znsRoute: `0.${route}` } } });

    expect(setRoute).toHaveBeenCalledWith({ route, hasAppChanged: false });
  });

  it('sets route when updated', () => {
    const setRoute = jest.fn();
    const route = 'icecream.flavors.pickle';

    const container = subject({
      setRoute,
      match: getMatchForParams({ znsRoute: '0.icecream.shop' }),
    });

    container.setProps({
      match: getMatchForParams({ znsRoute: `0.${route}` }),
    });

    expect(setRoute).toHaveBeenNthCalledWith(2, { route, hasAppChanged: false });
  });

  it('sets route if match does not have leading 0', () => {
    const setRoute = jest.fn();
    const route = 'icecream.flavors.pickle';

    const container = subject({
      setRoute,
      match: getMatchForParams({ znsRoute: '0.icecream.shop' }),
    });

    container.setProps({
      match: getMatchForParams({ znsRoute: route }),
    });

    expect(setRoute).toHaveBeenNthCalledWith(2, { route, hasAppChanged: false });
  });

  it('sets route if match has internal 0', () => {
    const setRoute = jest.fn();
    const route = 'icecream.flavors.0.pickle';

    const container = subject({
      setRoute,
      match: getMatchForParams({ znsRoute: '0.icecream.shop' }),
    });

    container.setProps({
      match: getMatchForParams({ znsRoute: route }),
    });

    expect(setRoute).toHaveBeenNthCalledWith(2, { route, hasAppChanged: false });
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
      match: getMatchForParams({ app: 'mIRC 2.1a' }),
    });

    container.setProps({ match: getMatchForParams({ app: 'ICQ 99a' }) });

    expect(setSelectedApp).toHaveBeenNthCalledWith(2, 'ICQ 99a');
  });

  it('sets DeepestVisitedRoute when switching apps', () => {
    const setRoute = jest.fn();
    const znsRoute = 'icecream.flavors.pickle';
    const app = 'ICQ 99a';

    const container = subject({
      setRoute,
      match: { params: { app: 'mIRC 2.1a', znsRoute: 'icecream.shop' } },
    });

    container.setProps({ match: { params: { app, znsRoute } } });

    expect(setRoute).toHaveBeenCalledWith({ route: znsRoute, hasAppChanged: true });
  });
});
