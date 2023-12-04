import React from 'react';

import { shallow } from 'enzyme';

import { LeaveGroupDialog, Properties } from '.';
import { buttonLabelled } from '../../../test/utils';

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

  it('renders different text if group name is not provided', function () {
    const wrapper = subject({ name: '' });

    expect(wrapper.find('.leave-group-dialog__body').text()).toContain('this group');
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

    buttonLabelled(wrapper, 'Cancel').simulate('press');
    expect(onClose).toHaveBeenCalled();
  });

  it('publishes onLeave event when leave group is clicked', () => {
    const onLeave = jest.fn();
    const wrapper = subject({ onLeave });

    buttonLabelled(wrapper, 'Leave Group').simulate('press');
    expect(onLeave).toHaveBeenCalled();
  });
});
