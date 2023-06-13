import React from 'react';
import { shallow } from 'enzyme';
import { Container } from './zns-route-connect';

describe('ZnsRouteConnect', () => {
  const getMatchForParams = (params = {}) => {
    return {
      params: {
        app: 'feed',
        znsRoute: '0.default',
        ...params,
      },
    };
  };

  const buildLocationProps = (props: any = {}) => {
    const match = getMatchForParams(props?.match?.params);

    return {
      match,
      location: {
        pathname: `/${match.params.znsRoute}/${match.params.app}`,
        search: '',
        ...(props.location || {}),
      },
    };
  };

  const mergeProps = (props: any) => {
    return {
      setRoute: () => undefined,
      setSelectedApp: () => undefined,
      ...props,
      ...buildLocationProps(props),
      history: {
        replace: () => undefined,
        ...(props.history || {}),
      },
    };
  };

  const subject = (props: any = {}) => {
    const allProps = mergeProps(props);

    return shallow(<Container {...allProps} />);
  };

  it('redirects on mount if znsRoute has no leading zero', () => {
    const replace = jest.fn();
    const znsRoute = 'icecream.shop';

    subject({
      location: {
        pathname: '/icecream.shop/feed',
        search: '',
      },
      history: { replace },
      match: getMatchForParams({ znsRoute, app: 'feed' }),
    });

    expect(replace).toHaveBeenCalledWith({
      pathname: '/0.icecream.shop/feed',
      search: '',
    });
  });

  it('sets route even if znsRoute has no leading zero', () => {
    const setRoute = jest.fn();
    const znsRoute = 'icecream.shop';

    subject({
      setRoute,
      location: {
        pathname: `/${znsRoute}/feed`,
        search: '',
      },
      match: getMatchForParams({ znsRoute, app: 'feed' }),
    });

    expect(setRoute).toHaveBeenCalledWith({ route: znsRoute, hasAppChanged: false });
  });

  it('sets app on mount even if znsRoute has no leading zero', () => {
    const setSelectedApp = jest.fn();
    const znsRoute = 'icecream.shop';

    subject({
      setSelectedApp,
      location: {
        pathname: `/${znsRoute}/feed`,
        search: '',
      },
      match: getMatchForParams({ znsRoute, app: 'feed' }),
    });

    expect(setSelectedApp).toHaveBeenCalledWith('feed');
  });

  it('redirects on update if znsRoute has no leading zero', () => {
    const replace = jest.fn();

    const wrapper = subject({
      location: {
        pathname: '/0.icecream.shop/feed',
        search: '',
      },
      history: { replace },
      match: getMatchForParams({ znsRoute: 'icecream.shop', app: 'feed' }),
    });

    wrapper.setProps({
      location: {
        pathname: '/icecream.shop.vanilla/feed',
      },
    });

    expect(replace).toHaveBeenCalledWith({
      pathname: '/0.icecream.shop.vanilla/feed',
      search: '',
    });
  });

  it('sets route on update even if no leading zero', () => {
    const setRoute = jest.fn();

    const wrapper = subject({
      setRoute,
      location: {
        pathname: '/0.icecream.shop/feed',
        search: '',
      },
      match: getMatchForParams({ znsRoute: '0.icecream.shop', app: 'feed' }),
    });

    wrapper.setProps(buildLocationProps({ match: getMatchForParams({ znsRoute: 'icecream.shop.vanilla' }) }));

    expect(setRoute).toHaveBeenNthCalledWith(2, { route: 'icecream.shop.vanilla', hasAppChanged: false });
  });

  it('does not set route on update if only change is added 0', () => {
    const setRoute = jest.fn();

    const wrapper = subject({
      setRoute,
      location: {
        pathname: '/icecream.shop/feed',
        search: '',
      },
      match: getMatchForParams({ znsRoute: 'icecream.shop', app: 'feed' }),
    });

    wrapper.setProps(buildLocationProps({ match: getMatchForParams({ znsRoute: '0.icecream.shop' }) }));

    expect(setRoute).toHaveBeenCalledOnce();
  });

  it('sets app on update even if route has no leading zero', () => {
    const setSelectedApp = jest.fn();

    const wrapper = subject({
      setSelectedApp,
      location: {
        pathname: '/0.icecream.shop/feed',
        search: '',
      },
      match: getMatchForParams({ znsRoute: '0.icecream.shop', app: 'feed' }),
    });

    wrapper.setProps(
      buildLocationProps({ match: getMatchForParams({ znsRoute: 'icecream.shop.vanilla', app: 'what' }) })
    );

    expect(setSelectedApp).toHaveBeenLastCalledWith('what');
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

    container.setProps(buildLocationProps({ match: getMatchForParams({ app: 'ICQ 99a' }) }));

    expect(setSelectedApp).toHaveBeenNthCalledWith(2, 'ICQ 99a');
  });

  it('pass hasAppChanged of true when switching apps', () => {
    const setRoute = jest.fn();
    const znsRoute = 'icecream.flavors.pickle';
    const app = 'ICQ 99a';

    const container = subject({
      setRoute,
      match: { params: { app: 'mIRC 2.1a', znsRoute: '0.icecream.shop' } },
    });

    container.setProps(buildLocationProps({ match: getMatchForParams({ app, znsRoute: `0.${znsRoute}` }) }));

    expect(setRoute).toHaveBeenCalledWith({ route: znsRoute, hasAppChanged: true });
  });
});
