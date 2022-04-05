import React from 'react';
import { shallow } from 'enzyme';
// import { Link } from 'react-router-dom';

import { AppMenu } from '.';
import { Apps } from '../../lib/apps';

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
    const wrapper = subject({ apps: [{
      type: 'food' as Apps,
      name: 'Food',
    }, {
      type: 'drink' as Apps,
      name: 'Drink',
    }]});

    const labels = wrapper
      .find('.app-menu__app')
      .map(element => element.text().trim());

    expect(labels).toStrictEqual(['Food', 'Drink']);
  });

  it('adds selected class to selected app', () => {
    const wrapper = subject({
      apps: [{
        type: 'food' as Apps,
        name: 'Food',
      }, {
        type: Apps.Feed,
        name: 'Feed',
      }],
      selectedApp: Apps.Feed,
    });

    const feedApp = wrapper
      .find('.app-menu__app')
      .filterWhere((app: any) => app.text().trim() === 'Feed')

    expect(feedApp.hasClass('selected')).toBe(true);
  });
});
