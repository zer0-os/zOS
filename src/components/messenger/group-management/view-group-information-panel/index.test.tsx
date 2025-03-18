import { shallow } from 'enzyme';

import { ViewGroupInformationPanel, Properties } from '.';
import { CitizenListItem } from '../../../citizen-list-item';
import { User } from '../../../../store/channels';
import { Image } from '@zero-tech/zui/components';
import { Button } from '@zero-tech/zui/components/Button';

import { IconUsers1 } from '@zero-tech/zui/icons';
import { bem } from '../../../../lib/bem';
import { Waypoint } from '../../../waypoint';

const c = bem('.view-group-information-panel');

describe(ViewGroupInformationPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      name: '',
      icon: '',
      currentUser: { userId: 'current-user' } as User,
      otherMembers: [],
      conversationAdminIds: [],
      conversationModeratorIds: [],
      canAddMembers: false,
      canEditGroup: false,
      canLeaveGroup: false,

      onAdd: () => null,
      onLeave: () => null,
      onEdit: () => null,
      onBack: () => null,
      onMemberSelected: () => null,
      openUserProfile: () => null,
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
    const wrapper = subject({ onEdit, canEditGroup: true });

    wrapper.find(Button).simulate('press');

    expect(onEdit).toHaveBeenCalled();
  });

  it('publishes onAdd event', () => {
    const onAdd = jest.fn();
    const wrapper = subject({ onAdd, canAddMembers: true });

    wrapper.find(c('add-icon')).simulate('click');

    expect(onAdd).toHaveBeenCalled();
  });

  it('publishes onMemberSelected event', () => {
    const onMemberSelected = jest.fn();
    const otherMembers = [
      { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
    ] as User[];

    const wrapper = subject({ onMemberSelected, otherMembers });

    wrapper.find(CitizenListItem).at(1).simulate('selected', 'otherMember1');

    expect(onMemberSelected).toHaveBeenCalled();
  });

  it('publishes openUserProfile event', () => {
    const openUserProfile = jest.fn();

    const wrapper = subject({
      openUserProfile,
      currentUser: { userId: 'currentUser', matrixId: 'matrix-id-4', firstName: 'Tom' } as any,
    });

    wrapper.find(CitizenListItem).at(0).simulate('selected', 'currentUser');

    expect(openUserProfile).toHaveBeenCalled();
  });

  it('publishes onLeave event', () => {
    const onLeave = jest.fn();
    const wrapper = subject({
      onLeave,
      canLeaveGroup: true,
      otherMembers: [
        { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
        { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie' },
      ] as User[],
    });

    wrapper.find(c('leave-group-button')).simulate('press');

    expect(onLeave).toHaveBeenCalled();
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

  it('renders edit button when user can edit group', () => {
    const wrapper = subject({ canEditGroup: true });
    expect(wrapper).toHaveElement(Button);
  });

  it('does not render edit button when user cannot edit group', () => {
    const wrapper = subject({ canEditGroup: false });
    expect(wrapper).not.toHaveElement(Button);
  });

  it('renders leave group button when current user can leave group and more than 1 other member', () => {
    const wrapper = subject({
      canLeaveGroup: true,
      otherMembers: [
        { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
        { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie' },
      ] as User[],
    });
    expect(wrapper).toHaveElement(c('leave-group-button'));
  });

  it('does not render leave group button when current user cannot leave group', () => {
    const wrapper = subject({ canLeaveGroup: false });
    expect(wrapper).not.toHaveElement(c('leave-group-button'));
  });

  it('renders add icon button when current user can add members', () => {
    const wrapper = subject({ canAddMembers: true });
    expect(wrapper).toHaveElement(c('add-icon'));
  });

  it('does not render add icon button when current user cannot add members', () => {
    const wrapper = subject({ canAddMembers: false });
    expect(wrapper).not.toHaveElement(c('add-icon'));
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

  it('assigns moderator tag to the user that is the conversation moderator', () => {
    const wrapper = subject({
      currentUser: { userId: 'currentUser', matrixId: 'matrix-id-current' } as User,
      otherMembers: [
        { userId: 'otherUser1', matrixId: 'matrix-id-1' },
        { userId: 'otherUser2', matrixId: 'matrix-id-2' },
      ] as User[],
      conversationAdminIds: [],
      conversationModeratorIds: ['otherUser1'],
    });

    expect(wrapper.find(CitizenListItem).at(0)).toHaveProp('tag', null); // current user is displayed at top
    expect(wrapper.find(CitizenListItem).at(1)).toHaveProp('tag', 'Mod');
    expect(wrapper.find(CitizenListItem).at(2)).toHaveProp('tag', null);
  });

  it('initially renders only PAGE_SIZE members and shows Waypoint', () => {
    const otherMembers = Array.from({ length: 30 }, (_, i) => ({
      userId: `user-${i}`,
      matrixId: `matrix-id-${i}`,
      firstName: `User ${i}`,
    })) as User[];

    const wrapper = subject({ otherMembers });

    expect(wrapper.find(CitizenListItem).length).toBe(21); // 1 current user + 20 other members
    expect(wrapper).toHaveElement(Waypoint);
  });

  it('shows loading spinner while loading more members', () => {
    const otherMembers = Array.from({ length: 30 }, (_, i) => ({
      userId: `user-${i}`,
      matrixId: `matrix-id-${i}`,
      firstName: `User ${i}`,
    })) as User[];

    const wrapper = subject({ otherMembers });

    wrapper.setState({ isLoadingMore: true });

    expect(wrapper).toHaveElement('Spinner');
  });

  it('does not show Waypoint when all members are loaded', () => {
    const otherMembers = Array.from({ length: 10 }, (_, i) => ({
      userId: `user-${i}`,
      matrixId: `matrix-id-${i}`,
      firstName: `User ${i}`,
    })) as User[];

    const wrapper = subject({ otherMembers });

    // Should not show Waypoint since all members can be displayed at once
    expect(wrapper).not.toHaveElement(Waypoint);
  });
});
