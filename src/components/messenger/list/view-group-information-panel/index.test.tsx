import { shallow } from 'enzyme';

import { ViewGroupInformationPanel, Properties } from '.';
import { CitizenListItem } from '../../../citizen-list-item';
import { User } from '../../../../store/channels';
import { Button, Image } from '@zero-tech/zui/components';
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
      conversationAdminIds: [],
      isCurrentUserRoomAdmin: false,

      onAdd: () => null,
      onEdit: () => null,
      onBack: () => null,
      ...props,
    };

    return shallow(<ViewGroupInformationPanel {...allProps} />);
  };

  it('publishes onBack event', () => {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(c('back-icon')).simulate('click');

    expect(onBack).toHaveBeenCalled();
  });

  it('publishes onEdit event', () => {
    const onEdit = jest.fn();
    const wrapper = subject({ onEdit, isCurrentUserRoomAdmin: true });

    wrapper.find(Button).simulate('press');

    expect(onEdit).toHaveBeenCalled();
  });

  it('publishes onAdd event', () => {
    const onAdd = jest.fn();
    const wrapper = subject({ onAdd, isCurrentUserRoomAdmin: true });

    wrapper.find(c('add-icon')).simulate('click');

    expect(onAdd).toHaveBeenCalled();
  });

  it('renders group name when name prop is provided', () => {
    const wrapper = subject({ name: 'test-group-name' });
    expect(wrapper.find(c('group-name'))).toHaveText('test-group-name');
  });

  it('renders custom group icon when icon prop is provided', () => {
    const wrapper = subject({ icon: 'test-icon-url' });
    expect(wrapper.find(Image)).toHaveProp('src', 'test-icon-url');
    expect(wrapper).not.toHaveElement(IconUsers1);
  });

  it('renders default group icon when icon prop is not provided', () => {
    const wrapper = subject({ icon: '' });
    expect(wrapper).toHaveElement(IconUsers1);
  });

  it('renders edit button when current user is admin', () => {
    const wrapper = subject({ isCurrentUserRoomAdmin: true });
    expect(wrapper).toHaveElement(Button);
  });

  it('renders add icon button when current user is admin', () => {
    const wrapper = subject({ isCurrentUserRoomAdmin: true });
    expect(wrapper).toHaveElement(c('add-icon'));
  });

  it('renders member header with correct count', () => {
    const otherMembers = [
      { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
      { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie' },
    ] as User[];
    const wrapper = subject({ otherMembers });
    expect(wrapper.find(c('member-header'))).toHaveText(`${otherMembers.length + 1} members`);
  });

  it('renders singular member when only one member is present', () => {
    const wrapper = subject({ otherMembers: [] });
    expect(wrapper.find(c('member-header'))).toHaveText('1 member');
  });

  it('renders the members of the conversation', function () {
    const wrapper = subject({
      currentUser: { userId: 'currentUser', matrixId: 'matrix-id-4', firstName: 'Tom' } as any,
      otherMembers: [
        { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
        { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie' },
      ] as User[],
    });

    expect(wrapper.find(CitizenListItem).map((c) => c.prop('user'))).toEqual([
      { userId: 'currentUser', matrixId: 'matrix-id-4', firstName: 'Tom' },
      { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
      { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie' },
    ]);
  });

  it('assigns admin tag to the user that is the conversation admin', () => {
    const wrapper = subject({
      currentUser: { userId: 'currentUser', matrixId: 'matrix-id-current' } as User,
      otherMembers: [
        { userId: 'otherUser1', matrixId: 'matrix-id-1' },
        { userId: 'otherUser2', matrixId: 'matrix-id-2' },
      ] as User[],
      conversationAdminIds: ['matrix-id-1'],
    });

    expect(wrapper.find(CitizenListItem).at(0)).toHaveProp('tag', null);
    expect(wrapper.find(CitizenListItem).at(1)).toHaveProp('tag', 'Admin');
    expect(wrapper.find(CitizenListItem).at(2)).toHaveProp('tag', null);
  });
});
