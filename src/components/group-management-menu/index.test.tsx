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
      onStartAddMember: () => {},

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
      const dropdownMenu = wrapper.find(DropdownMenu);
      expect(dropdownMenu.prop('items').some((item) => item.id === 'add-member')).toBe(false);
    });

    it('renders add member menu item when isRoomAdmin is true and enableAddMemberToGroup feature flag is true', function () {
      featureFlags.enableAddMemberToGroup = true;

      const wrapper = subject({ isRoomAdmin: true });
      const dropdownMenu = wrapper.find(DropdownMenu);
      expect(dropdownMenu.prop('items').some((item) => item.id === 'add-member')).toBe(true);
    });

    it('calls onStartAddMember when the add member menu item is selected', function () {
      featureFlags.enableAddMemberToGroup = true;

      const mockOnStartAddMember = jest.fn();
      const wrapper = subject({ isRoomAdmin: true, onStartAddMember: mockOnStartAddMember });
      const dropdownMenu = wrapper.find(DropdownMenu);
      const addMemberMenuItem = dropdownMenu.prop('items').find((item) => item.id === 'add-member');

      addMemberMenuItem.onSelect();

      expect(mockOnStartAddMember).toHaveBeenCalled();
    });
  });
});
