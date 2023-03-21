import React from 'react';
import { shallow } from 'enzyme';

import { Properties, UserMenuPopupContent } from './user-menu-popup';

describe('UserActions', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      address: '',
      onDisconnect: () => undefined,
      ...props,
    };

    return shallow(<UserMenuPopupContent {...allProps} />);
  };

  it('renders user address', () => {
    const wrapper = subject({ address: '0x1234000000000000000000000000000000009876' });

    expect(wrapper.find('.user-menu-popup__address').text()).toEqual('0x1234...9876');
  });

  it('publishes disconnect', () => {
    const onDisconnect = jest.fn();

    const wrapper = subject({ onDisconnect });
    wrapper.find('Button').simulate('press');

    expect(onDisconnect).toHaveBeenCalledOnce();
  });
});
