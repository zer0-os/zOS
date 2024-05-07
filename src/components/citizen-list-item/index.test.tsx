import { shallow } from 'enzyme';

import { CitizenListItem, Properties } from '.';
import { bem } from '../../lib/bem';
import { Avatar, IconButton } from '@zero-tech/zui/components';

const c = bem('.citizen-list-item');

describe(CitizenListItem, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      user: { userId: 'stub' } as any,

      onMemberSelected: () => null,
      ...props,
    };

    return shallow(<CitizenListItem {...allProps} />);
  };

  it('renders the user display name', function () {
    const wrapper = subject({ user: { firstName: 'John', lastName: 'Doe' } as any });

    const name = wrapper.find(c('name'));

    expect(name).toHaveText('John Doe');
  });

  it('renders the handle (primaryZID or public wallet address)', function () {
    const wrapper = subject({ user: { displaySubHandle: '0://zero:tech' } as any });

    const handle = wrapper.find(c('handle'));

    expect(handle).toHaveText('0://zero:tech');
  });

  it('renders the user status', function () {
    const wrapper = subject({ user: { isOnline: false } as any });

    const avatar = wrapper.find(Avatar);

    expect(avatar).toHaveProp('statusType', 'offline');
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

  it('publishes member click event when clicked', function () {
    const onMemberSelected = jest.fn();
    const wrapper = subject({ onMemberSelected, user: { userId: 'user-id' } as any });

    wrapper.find(c('')).simulate('click');

    expect(onMemberSelected).toHaveBeenCalledWith('user-id');
  });

  it('publishes member click event on "Enter" key press', function () {
    const onMemberSelected = jest.fn();
    const wrapper = subject({ onMemberSelected, user: { userId: 'user-id' } as any });

    wrapper.find(c('')).simulate('keydown', { key: 'Enter' });

    expect(onMemberSelected).toHaveBeenCalledWith('user-id');
  });
});
