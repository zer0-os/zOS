import React from 'react';

import { shallow } from 'enzyme';

import { LeaveGroupDialog, Properties } from '.';
import { bem } from '../../../lib/bem';
import { Modal } from '../../modal';

const c = bem('.leave-group-dialog');

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

    expect(wrapper.find(c('')).text()).toContain('zOS test group');
  });

  it('renders different text if group name is not provided', function () {
    const wrapper = subject({ name: '' });

    expect(wrapper.find(c('')).text()).toContain('this group');
  });

  it('publishes close event when modal is closed', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(Modal).simulate('close');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes onClose event when "cancel" button is clicked', () => {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(Modal).simulate('secondary');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes onLeave event when leave group is clicked', () => {
    const onLeave = jest.fn();
    const wrapper = subject({ onLeave });

    wrapper.find(Modal).simulate('primary');

    expect(onLeave).toHaveBeenCalled();
  });
});
