import React from 'react';
import { shallow } from 'enzyme';
import { Properties, GroupManagementMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';

const featureFlags = { enableGroupInformation: false };
jest.mock('../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe(GroupManagementMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      canAddMembers: true,
      canLeaveRoom: true,
      canEdit: true,
      canViewGroupInformation: true,
      onStartAddMember: () => {},
      onLeave: () => {},
      onEdit: () => {},
      onViewGroupInformation: () => {},
      ...props,
    };

    return shallow(<GroupManagementMenu {...allProps} />);
  };

  it('does not render the menu if user cannot do anything', function () {
    const wrapper = subject({
      canAddMembers: false,
      canLeaveRoom: false,
      canEdit: false,
    });

    expect(wrapper).not.toHaveElement(DropdownMenu);
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

  describe('Group Info', () => {
    it('calls onViewGroupInformation when the group info menu item is selected', () => {
      featureFlags.enableGroupInformation = true;
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
});

function selectItem(wrapper, id) {
  menuItem(wrapper, id).onSelect();
}

function menuItem(menu, id) {
  const dropdownMenu = menu.find(DropdownMenu);
  return dropdownMenu.prop('items').find((i) => i.id === id);
}
