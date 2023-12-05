import React from 'react';
import { shallow } from 'enzyme';
import { Properties, GroupManagementMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';

const featureFlags = { enableAddMemberToGroup: false };
jest.mock('../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe(GroupManagementMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isRoomAdmin: false,
      canLeaveRoom: true,
      onStartAddMember: () => {},

      onLeave: () => {},
      ...props,
    };

    return shallow(<GroupManagementMenu {...allProps} />);
  };

  it('renders DropdownMenu component', function () {
    const wrapper = subject();

    expect(wrapper).toHaveElement(DropdownMenu);
  });

  describe('Add Member', () => {
    it('does not render add member menu item when isRoomAdmin is false and enableAddMemberToGroup feature flag is true', function () {
      featureFlags.enableAddMemberToGroup = true;

      const wrapper = subject({ isRoomAdmin: false });
      expect(menuItem(wrapper, 'add-member')).toBeFalsy();
    });

    it('renders add member menu item when isRoomAdmin is true and enableAddMemberToGroup feature flag is true', function () {
      featureFlags.enableAddMemberToGroup = true;

      const wrapper = subject({ isRoomAdmin: true });
      expect(menuItem(wrapper, 'add-member')).toBeTruthy();
    });

    it('calls onStartAddMember when the add member menu item is selected', function () {
      featureFlags.enableAddMemberToGroup = true;

      const mockOnStartAddMember = jest.fn();
      const wrapper = subject({ isRoomAdmin: true, onStartAddMember: mockOnStartAddMember });
      const addMemberMenuItem = menuItem(wrapper, 'add-member');
      addMemberMenuItem.onSelect();

      expect(mockOnStartAddMember).toHaveBeenCalled();
    });
  });

  describe('Leave Group', () => {
    it('publishes onLeave event when leave group is clicked', () => {
      const onLeave = jest.fn();
      const wrapper = subject({ onLeave, canLeaveRoom: true });

      menuItem(wrapper, 'leave_group').onSelect();

      expect(onLeave).toHaveBeenCalled();
    });

    it('does not render leave group menu item when canLeaveRoom is false', function () {
      const wrapper = subject({ canLeaveRoom: false });
      expect(menuItem(wrapper, 'leave_group')).toBeFalsy();
    });
  });
});

function menuItem(menu, id) {
  const dropdownMenu = menu.find(DropdownMenu);
  return dropdownMenu.prop('items').find((i) => i.id === id);
}
