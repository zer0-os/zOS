import { shallow } from 'enzyme';

import { ViewGroupInformationPanel, Properties } from '.';
import { CitizenListItem } from '../../../citizen-list-item';
import { User } from '../../../../store/channels';
import { PanelHeader } from '../panel-header';

import { IconUsers1 } from '@zero-tech/zui/icons';
import { bem } from '../../../../lib/bem';

const c = bem('.view-group-information-panel');

describe(ViewGroupInformationPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      name: '',
      icon: '',
      currentUser: { userId: 'current-user' } as User,
      otherMembers: [],

      onBack: () => null,
      ...props,
    };

    return shallow(<ViewGroupInformationPanel {...allProps} />);
  };

  it('publishes onBack event', () => {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(PanelHeader).simulate('back');

    expect(onBack).toHaveBeenCalled();
  });

  it('renders group name when name prop is provided', () => {
    const wrapper = subject({ name: 'test-group-name' });
    expect(wrapper.find(c('group-name'))).toHaveText('test-group-name');
  });

  it('renders custom group icon when icon prop is provided', () => {
    const iconUrl = 'test-icon-url';
    const wrapper = subject({ icon: iconUrl });
    const image = wrapper.find('.view-group-information-panel__custom-group-icon');
    expect(image.length).toEqual(1);
    expect(image.prop('src')).toEqual(iconUrl);
  });

  it('renders default group icon when icon prop is not provided', () => {
    const wrapper = subject({ icon: '' });
    const defaultIcon = wrapper.find(IconUsers1);
    expect(defaultIcon.length).toEqual(1);
    expect(defaultIcon.prop('size')).toEqual(60);
  });

  it('renders member header with correct count', () => {
    const otherMembers = [{ userId: '1' }, { userId: '2' }] as User[];
    const wrapper = subject({ otherMembers });
    expect(wrapper.find(c('member-header'))).toHaveText(`${otherMembers.length + 1} members`);
  });

  it('renders singular member when only one member is present', () => {
    const wrapper = subject({ otherMembers: [] });
    expect(wrapper.find(c('member-header'))).toHaveText('1 member');
  });

  it('renders the members of the conversation', function () {
    const wrapper = subject({
      currentUser: { userId: 'Admin' } as any,
      otherMembers: [{ userId: '1' }, { userId: '2' }, { userId: '3' }] as any,
    });

    expect(wrapper.find(CitizenListItem).map((c) => c.prop('user'))).toEqual([
      { userId: 'Admin' },
      { userId: '1' },
      { userId: '2' },
      { userId: '3' },
    ]);
  });
});
