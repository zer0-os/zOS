import React from 'react';
import { shallow } from 'enzyme';

import { NotificationPopup, Properties } from '.';
import { NotificationListContainer } from '../list/container';
import { ModalConfirmation } from '@zero-tech/zui/components';

jest.mock('react-dom', () => ({
  createPortal: (node, _portalLocation) => {
    return node;
  },
}));

describe('NotificationPopup', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<NotificationPopup {...allProps} />);
  };

  it('renders  NotificationListContainer', () => {
    const wrapper = subject({});

    expect(wrapper.find(NotificationListContainer).exists()).toBeTrue();
  });

  it('renders settings icon', () => {
    const wrapper = subject({});

    expect(wrapper.find('.notification-popup_settings-icon').exists()).toBeTrue();
  });

  it('renders settings popup', () => {
    const wrapper = subject({});

    wrapper.find('.notification-popup_settings-icon').simulate('click');

    expect(wrapper.find('.settings-popup').exists()).toBeTrue();
  });

  it('renders modal notifications', () => {
    const wrapper = subject({});

    wrapper.find('.notification-popup_settings-icon').simulate('click');

    wrapper.find('.settings-popup__text').simulate('click');

    expect(wrapper.find(ModalConfirmation).exists()).toBeTrue();
  });
});
