import React from 'react';
import { shallow } from 'enzyme';
import { Properties, GroupManagementMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components/DropdownMenu';

describe(GroupManagementMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      canAddMembers: true,
      canLeaveRoom: true,
      canEdit: true,
      canReportUser: true,
      canViewGroupInformation: true,
      isRoomMuted: false,
      onStartAddMember: () => {},
      onLeave: () => {},
      onEdit: () => {},
      onViewGroupInformation: () => {},
      onMute: () => {},
      onUnmute: () => {},
      onReportUser: () => {},
      ...props,
    };

    return shallow(<GroupManagementMenu {...allProps} />);
  };

  it('only renders mute notifications toggle menu item if user cannot do anything', function () {
    const wrapper = subject({
      canAddMembers: false,
      canLeaveRoom: false,
      canEdit: false,
      canViewGroupInformation: false,
      canReportUser: false,
    });

    expect(wrapper).toHaveElement(DropdownMenu);
    expect(wrapper.find(DropdownMenu).prop('items')).toHaveLength(1);
    expect(wrapper.find(DropdownMenu).prop('items')[0].id).toEqual('mute_notifications');
  });

  describe('Add Member', () => {
    it('does not render add member menu item when canAddMembers is false', function () {
      const wrapper = subject({ canAddMembers: false });
      expect(menuItem(wrapper, 'add-member')).toBeFalsy();
    });

    it('calls onStartAddMember when the add member menu item is selected', function () {
      const mockOnStartAddMember = jest.fn();
      const wrapper = subject({ canAddMembers: true, onStartAddMember: mockOnStartAddMember });
      selectItem(wrapper, 'add-member');

      expect(mockOnStartAddMember).toHaveBeenCalled();
    });
  });

  describe('Leave Group', () => {
    it('publishes onLeave event when leave group is clicked', () => {
      const onLeave = jest.fn();
      const wrapper = subject({ onLeave, canLeaveRoom: true });

      selectItem(wrapper, 'leave_group');

      expect(onLeave).toHaveBeenCalled();
    });

    it('does not render leave group menu item when canLeaveRoom is false', function () {
      const wrapper = subject({ canLeaveRoom: false });
      expect(menuItem(wrapper, 'leave_group')).toBeFalsy();
    });
  });

  describe('Edit', () => {
    it('publishes onEdit event when clicked', () => {
      const onEdit = jest.fn();
      const wrapper = subject({ onEdit, canEdit: true });

      selectItem(wrapper, 'edit_group');

      expect(onEdit).toHaveBeenCalled();
    });

    it('does not render item when canEditRoom is false', function () {
      const wrapper = subject({ canEdit: false });
      expect(menuItem(wrapper, 'edit_group')).toBeFalsy();
    });
  });

  describe('View Group Information', () => {
    it('calls onViewGroupInformation when the group info menu item is selected', () => {
      const onViewGroupInformation = jest.fn();
      const wrapper = subject({ onViewGroupInformation });

      selectItem(wrapper, 'group_information');

      expect(onViewGroupInformation).toHaveBeenCalled();
    });

    it('does not render item when canViewGroupInformation is false', function () {
      const wrapper = subject({ canViewGroupInformation: false });
      expect(menuItem(wrapper, 'group_information')).toBeFalsy();
    });
  });

  describe('Mute', () => {
    it('calls onMute when the mute menu item is selected and isRoomMuted is false', () => {
      const onMute = jest.fn();
      const wrapper = subject({ onMute, isRoomMuted: false });

      selectItem(wrapper, 'mute_notifications');

      expect(onMute).toHaveBeenCalled();
    });

    it('calls onUnmute when the unmute menu item is selected and isRoomMuted is true', () => {
      const onUnmute = jest.fn();
      const wrapper = subject({ onUnmute, isRoomMuted: true });

      selectItem(wrapper, 'mute_notifications');

      expect(onUnmute).toHaveBeenCalled();
    });

    it('renders "Mute Notifications" text when isRoomMuted is false', () => {
      const wrapper = subject({ isRoomMuted: false });

      const muteNotificationsItem = menuItem(wrapper, 'mute_notifications');

      expectLabelToContainText(muteNotificationsItem, 'Mute Notifications');
    });

    it('renders "Unmute Notifications" text when isRoomMuted is true', () => {
      const wrapper = subject({ isRoomMuted: true });

      const unmuteNotificationsItem = menuItem(wrapper, 'mute_notifications');

      expectLabelToContainText(unmuteNotificationsItem, 'Unmute Notifications');
    });
  });

  describe('Report User', () => {
    it('calls onReportUser when the report user menu item is selected', () => {
      const onReportUser = jest.fn();
      const wrapper = subject({ onReportUser, canReportUser: true });

      selectItem(wrapper, 'report_user');

      expect(onReportUser).toHaveBeenCalled();
    });

    it('does not render item when canReportUser is false', function () {
      const wrapper = subject({ canReportUser: false });
      expect(menuItem(wrapper, 'report_user')).toBeFalsy();
    });
  });
});

function selectItem(wrapper, id) {
  menuItem(wrapper, id).onSelect();
}

function menuItem(menu, id) {
  const dropdownMenu = menu.find(DropdownMenu);
  return dropdownMenu.prop('items').find((i) => i.id === id);
}

function expectLabelToContainText(item, expectedText) {
  const label = shallow(item.label);
  expect(label.text()).toContain(expectedText);
}
