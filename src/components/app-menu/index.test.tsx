import React from 'react';
import { shallow } from 'enzyme';
import { AppMenu } from '.';
import { Apps } from '../../lib/apps';
import { Link } from 'react-router-dom';

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
      type: Apps.DAOS,
      name: 'DAOS',
    }, {
      type: Apps.Staking,
      name: 'Staking',
    }]});

    const labels = wrapper
      .find('.app-menu__app')
      .map(element => element.text().trim());

    expect(labels).toStrictEqual(['DAOS', 'Staking']);
  });

  it('renders a Link for each app', () => {
    const wrapper = subject({ route: 'what.is.this', apps: [{
      type: Apps.DAOS,
      name: 'DAOS',
    }, {
      type: Apps.Staking,
      name: 'Staking',
    }]});

    const labels = wrapper
      .find(Link)
      .map(element => element.prop('to'));

    expect(labels).toStrictEqual(['/what.is.this/daos', '/what.is.this/staking']);
  });

  it('adds selected class to selected app', () => {
    const wrapper = subject({
      apps: [{
        type: Apps.Staking,
        name: 'Staking',
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
