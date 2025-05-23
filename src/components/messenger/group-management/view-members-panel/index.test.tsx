import { shallow } from 'enzyme';

import { ViewMembersPanel, Properties } from '.';
import { CitizenListItem } from '../../../citizen-list-item';
import { User } from '../../../../store/channels';
import { Waypoint } from '../../../waypoint';

import { bem } from '../../../../lib/bem';

const c = bem('.view-members-panel');

describe(ViewMembersPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isOneOnOne: false,
      currentUser: { userId: 'current-user' } as User,
      otherMembers: [],
      conversationAdminIds: [],
      canAddMembers: false,
      conversationModeratorIds: [],

      onAdd: () => null,

      ...props,
    };

    return shallow(<ViewMembersPanel {...allProps} />);
  };

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

    expect(wrapper).not.toHaveElement(Waypoint);
  });

  it('publishes onAdd event', () => {
    const onAdd = jest.fn();
    const wrapper = subject({ onAdd, canAddMembers: true });

    wrapper.find(c('add-icon')).simulate('click');

    expect(onAdd).toHaveBeenCalled();
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

  it('does not assign admin tags if conversation is one on one', () => {
    const wrapper = subject({
      currentUser: { userId: 'currentUser', matrixId: 'matrix-id-current' } as User,
      otherMembers: [{ userId: 'otherUser1', matrixId: 'matrix-id-1' }] as User[],
      conversationAdminIds: ['matrix-id-1'],
      isOneOnOne: true,
    });

    expect(wrapper.find(CitizenListItem).at(0)).toHaveProp('tag', null);
    expect(wrapper.find(CitizenListItem).at(1)).toHaveProp('tag', null);
  });

  it('assigns moderator tag to the user that is the conversation moderator', () => {
    const wrapper = subject({
      currentUser: { userId: 'currentUser', matrixId: 'matrix-id-current' } as User,
      otherMembers: [
        { userId: 'otherUser1', matrixId: 'matrix-id-1' },
        { userId: 'otherUser2', matrixId: 'matrix-id-2' },
      ] as User[],
      conversationAdminIds: [],
      conversationModeratorIds: ['matrix-id-1'],
    });

    expect(wrapper.find(CitizenListItem).at(0)).toHaveProp('tag', null); // current user is displayed at top
    expect(wrapper.find(CitizenListItem).at(1)).toHaveProp('tag', 'Mod');
    expect(wrapper.find(CitizenListItem).at(2)).toHaveProp('tag', null);
  });
});
