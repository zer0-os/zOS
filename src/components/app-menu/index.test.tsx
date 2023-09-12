import React from 'react';
import { shallow } from 'enzyme';
import { AppMenu } from '.';
import { Apps } from '../../lib/apps';
import { ZnsLink } from '@zer0-os/zos-component-library';

describe('AppMenu', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      apps: [],
      ...props,
    };

    return shallow(<AppMenu {...allProps} />);
  };

  it('adds class', () => {
    const wrapper = subject({ className: 'the-class' });

    expect(wrapper.find('.app-menu').hasClass('the-class')).toBe(true);
  });

  it('renders a menu item for each app', () => {
    const wrapper = subject({
      apps: [
        {
          type: Apps.Channels,
          name: 'Chat',
        },
      ],
    });

    const labels = wrapper.find('.app-menu__app-name').map((element) => element.text().trim());

    expect(labels).toStrictEqual(['Chat']);
  });

  it('renders a ZnsLink for each app', () => {
    const wrapper = subject({
      route: 'what.is.this',
      apps: [
        {
          type: Apps.Channels,
          name: 'Chat',
        },
      ],
    });

    const linkProps = wrapper.find(ZnsLink).map((element) => ({
      route: element.prop('route'),
      app: element.prop('app'),
    }));

    expect(linkProps).toStrictEqual([{ route: 'what.is.this', app: Apps.Channels }]);
  });

  it('adds selected class to selected app', () => {
    const wrapper = subject({
      apps: [
        {
          type: Apps.Channels,
          name: 'Chat',
        },
      ],
      selectedApp: Apps.Channels,
    });

    const feedApp = wrapper
      .find('.app-menu__app')
      .filterWhere((app: any) => app.find('.app-menu__app-name').text().trim() === 'Chat');

    expect(feedApp.hasClass('selected')).toBe(true);
  });
});
