import { shallow } from 'enzyme';

import { CitizenListItem, Properties } from '.';
import { bem } from '../../lib/bem';
import { Avatar, IconButton } from '@zero-tech/zui/components';

const c = bem('.citizen-list-item');

describe(CitizenListItem, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      user: { userId: 'stub' } as any,
      ...props,
    };

    return shallow(<CitizenListItem {...allProps} />);
  };

  it('renders the user display name', function () {
    const wrapper = subject({ user: { firstName: 'John', lastName: 'Doe' } as any });

    expect(wrapper.find(c('name')).text()).toEqual('John Doe');
  });

  it('renders the user primary zid', function () {
    const wrapper = subject({ user: { primaryZID: '0://zero:tech' } as any });

    expect(wrapper.find(c('primary-zid')).text()).toEqual('0://zero:tech');
  });

  it('renders the user status', function () {
    const wrapper = subject({ user: { isOnline: false } as any });

    expect(wrapper.find(Avatar).prop('statusType')).toEqual('offline');
  });

  it('publishes remove event', function () {
    const onRemove = jest.fn();
    const wrapper = subject({ onRemove, user: { userId: 'user-id' } as any });

    wrapper.find(IconButton).simulate('click');

    expect(onRemove).toHaveBeenCalledWith('user-id');
  });

  it('does not render remove icon if no handler provided', function () {
    const wrapper = subject({});

    expect(wrapper).not.toHaveElement(IconButton);
  });

  it('renders a tag if provided', function () {
    const wrapper = subject({ tag: 'Admin' });

    expect(wrapper.find(c('tag')).text()).toEqual('Admin');
  });

  it('does NOT render tag if NOT provided', function () {
    const wrapper = subject({});

    expect(wrapper).not.toHaveElement(c('tag'));
  });
});
