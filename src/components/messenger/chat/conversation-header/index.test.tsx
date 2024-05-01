import { shallow } from 'enzyme';

import { ConversationHeader, Properties } from '.';
import Tooltip from '../../../tooltip';
import { otherMembersToString } from '../../../../platform-apps/channels/util';
import { GroupManagementMenu } from '../../../group-management-menu';
import { bem } from '../../../../lib/bem';
import { stubUser } from '../../../../store/test/store';

import { Avatar } from '@zero-tech/zui/components';

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
      onAddMember: () => null,
      onEdit: () => null,
      onLeaveRoom: () => null,
      onViewDetails: () => null,

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

    it('header renders online status in the subtitle', function () {
      const wrapper = subject({ otherMembers: [stubUser({ isOnline: true })] });

      expect(wrapper.find(c('subtitle'))).toHaveText('Online');
    });

    it('header renders avatar online status', function () {
      const wrapper = subject({ otherMembers: [stubUser({ isOnline: true })] });

      expect(wrapper.find(Avatar)).toHaveProp('statusType', 'active');
    });

    it('header renders offline status', function () {
      const wrapper = subject({ otherMembers: [stubUser({ isOnline: false })] });

      expect(wrapper.find(Avatar)).toHaveProp('statusType', 'offline');
    });

    it('renders a formatted subtitle', function () {
      const wrapper = subject({
        isOneOnOne: true,
        otherMembers: [stubUser({ displaySubHandle: '0://arc:vet', isOnline: true, lastSeenAt: null })],
      });

      expect(wrapper.find(c('subtitle'))).toHaveText('0://arc:vet | Online');
    });

    it('renders empty subtitle if no primaryZID, no wallet and no lastSeenAt', function () {
      const wrapper = subject({ isOneOnOne: true, otherMembers: [stubUser({ displaySubHandle: '' })] });

      expect(wrapper.find(c('subtitle'))).toHaveText('');
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

    it('header renders online status in the subtitle if any member is online', function () {
      const wrapper = subject({
        isOneOnOne: false,
        otherMembers: [stubUser({ isOnline: false }), stubUser({ isOnline: true })],
      });

      expect(wrapper.find(c('subtitle'))).toHaveText('Online');
    });

    it('header renders online status if any member is online', function () {
      const wrapper = subject({
        isOneOnOne: false,
        otherMembers: [stubUser({ isOnline: false }), stubUser({ isOnline: true })],
      });

      expect(wrapper.find(Avatar)).toHaveProp('statusType', 'active');
    });

    it('header renders offline status', function () {
      const wrapper = subject({
        isOneOnOne: false,
        otherMembers: [stubUser({ isOnline: false }), stubUser({ isOnline: false })],
      });

      expect(wrapper.find(Avatar)).toHaveProp('statusType', 'offline');
    });

    it('renders online status as subtitle ', function () {
      const wrapper = subject({
        isOneOnOne: false,
        otherMembers: [stubUser({ displaySubHandle: '0://arc:vet', isOnline: false })],
      });

      expect(wrapper.find(c('subtitle'))).toHaveText('Offline');
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
  });
});
