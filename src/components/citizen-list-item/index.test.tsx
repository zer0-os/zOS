import { shallow } from 'enzyme';

import { CitizenListItem, Properties } from '.';
import { bem } from '../../lib/bem';
import { Avatar } from '@zero-tech/zui/components';

const c = bem('.citizen-list-item');

describe('CitizenListItem', () => {
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

  it('renders unknown display name', function () {
    const wrapper = subject({ user: { firstName: '', lastName: '' } as any });

    expect(wrapper.find(c('name')).text()).toEqual('Unknown');
  });

  it('renders the user status', function () {
    const wrapper = subject({ user: { isOnline: false } as any });

    expect(wrapper.find(Avatar).prop('statusType')).toEqual('offline');
  });
});
