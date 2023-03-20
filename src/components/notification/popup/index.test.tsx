import React from 'react';
import { shallow } from 'enzyme';

import { NotificationPopup, Properties } from '.';
import moment from 'moment';
import { NotificationListContainer } from '../list/container';

describe('NotificationPopup', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<NotificationPopup {...allProps} />);
  };

  it('renders  NotificationListContainer', () => {
    const wrapper = subject({});

    expect(wrapper.find(NotificationListContainer).exists()).tobetrue();
  });

  it('renders settings icon', () => {
    const wrapper = subject({});

    expect(wrapper.find('.notification-popup_settings-icon').exists()).tobetrue();
  });

  it('renders modal notifications', () => {
    const wrapper = subject({});

    wrapper.find('.notification-popup_settings-icon').simulate('click');

    expect(wrapper.find('.modal-notifications').exists()).tobetrue();
  });
});
