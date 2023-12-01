import React from 'react';

import { shallow } from 'enzyme';

import { LeaveGroupDialog, Properties } from '.';

describe('InviteDialog', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      name: '',
      status: 0,
      onClose: () => {},
      onLeave: () => {},
      ...props,
    };

    return shallow(<LeaveGroupDialog {...allProps} />);
  };

  it('renders the name of group', function () {
    const wrapper = subject({ name: 'zOS test group' });

    expect(wrapper.find('.leave-group-dialog__body').text()).toContain('zOS test group');
  });

  it('publishes close event when modal is closed', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('IconButton').simulate('click');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes onClose event when "cancel" button is clicked', () => {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('Button[variant="text"]').simulate('press');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes onLeave event when leave group is clicked', () => {
    const onLeave = jest.fn();
    const wrapper = subject({ onLeave });

    wrapper.find('Button[variant="negative"]').simulate('press');

    expect(onLeave).toHaveBeenCalled();
  });
});
