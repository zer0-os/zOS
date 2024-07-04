import { shallow } from 'enzyme';

import { ConversationHeader, Properties } from '.';
import Tooltip from '../../../tooltip';
import { otherMembersToString } from '../../../../platform-apps/channels/util';
import { GroupManagementMenu } from '../../../group-management-menu';
import { bem } from '../../../../lib/bem';
import { stubUser } from '../../../../store/test/store';

const c = bem('.conversation-header');

describe(ConversationHeader, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isOneOnOne: false,
      otherMembers: [],
      icon: '',
      name: '',
      canAddMembers: false,
      canLeaveRoom: false,
      canEdit: false,
      canViewDetails: false,
      isSecondarySidekickOpen: false,
      isRoomMuted: false,
      onAddMember: () => null,
      onEdit: () => null,
      onLeaveRoom: () => null,
      onViewDetails: () => null,
      toggleSecondarySidekick: () => null,
      onMuteRoom: () => null,
      onUnmuteRoom: () => null,

      ...props,
    };

    return shallow(<ConversationHeader {...allProps} />);
  };

  describe('title', () => {
    it('renders channel name as title when name is provided', function () {
      const wrapper = subject({ name: 'this is my channel name' });

      expect(wrapper.find(Tooltip).html()).toContain('this is my channel name');
    });

    it('renders otherMembers as title when name is NOT provided', function () {
      const wrapper = subject({ otherMembers: [stubUser({ firstName: 'first-name', lastName: 'last-name' })] });

      expect(wrapper.find(Tooltip).html()).toContain(
        otherMembersToString([stubUser({ firstName: 'first-name', lastName: 'last-name' })])
      );
    });

    it('renders otherMembers in tooltip', function () {
      const wrapper = subject({ otherMembers: [stubUser({ firstName: 'first-name', lastName: 'last-name' })] });

      expect(wrapper.find(Tooltip)).toHaveProp(
        'overlay',
        otherMembersToString([stubUser({ firstName: 'first-name', lastName: 'last-name' })])
      );
    });
  });

  describe('one on one chat', function () {
    it('header renders full name in the title', function () {
      const wrapper = subject({
        otherMembers: [stubUser({ firstName: 'Johnny', lastName: 'Sanderson' })],
      });

      expect(wrapper.find(Tooltip).html()).toContain('Johnny Sanderson');
    });
  });

  describe('one to many chat', function () {
    it('header renders full names in the title', function () {
      const wrapper = subject({
        isOneOnOne: false,
        otherMembers: [
          stubUser({ firstName: 'Johnny', lastName: 'Sanderson' }),
          stubUser({ firstName: 'Jack', lastName: 'Black' }),
        ],
      });

      expect(wrapper.find(Tooltip).html()).toContain('Johnny Sanderson, Jack Black');
    });

    it('fires toggleSecondarySidekick', function () {
      const toggleSecondarySidekick = jest.fn();

      subject({ isOneOnOne: false, toggleSecondarySidekick }).find(c('group-button')).simulate('click');

      expect(toggleSecondarySidekick).toHaveBeenCalledOnce();
    });
  });

  describe('group management', function () {
    it('onAddMember', function () {
      const onAddMember = jest.fn();

      subject({ onAddMember }).find(GroupManagementMenu).simulate('startAddMember');

      expect(onAddMember).toHaveBeenCalledOnce();
    });

    it('onEdit', function () {
      const onEdit = jest.fn();

      subject({ onEdit }).find(GroupManagementMenu).simulate('edit');

      expect(onEdit).toHaveBeenCalledOnce();
    });

    it('onLeaveRoom', function () {
      const onLeaveRoom = jest.fn();

      subject({ onLeaveRoom }).find(GroupManagementMenu).simulate('leave');

      expect(onLeaveRoom).toHaveBeenCalledOnce();
    });

    it('onViewDetails', function () {
      const onViewDetails = jest.fn();

      subject({ onViewDetails }).find(GroupManagementMenu).simulate('viewGroupInformation');

      expect(onViewDetails).toHaveBeenCalledOnce();
    });

    it('onMuteRoom', function () {
      const onMuteRoom = jest.fn();

      subject({ onMuteRoom }).find(GroupManagementMenu).simulate('mute');

      expect(onMuteRoom).toHaveBeenCalledOnce();
    });

    it('onUnmuteRoom', function () {
      const onUnmuteRoom = jest.fn();

      subject({ onUnmuteRoom }).find(GroupManagementMenu).simulate('unmute');

      expect(onUnmuteRoom).toHaveBeenCalledOnce();
    });
  });
});
