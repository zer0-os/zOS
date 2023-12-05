import React from 'react';
import { shallow } from 'enzyme';
import { Properties, GroupManagementMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';

describe(GroupManagementMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      canAddMembers: true,
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
});

function selectItem(wrapper, id) {
  menuItem(wrapper, id).onSelect();
}

function menuItem(menu, id) {
  const dropdownMenu = menu.find(DropdownMenu);
  return dropdownMenu.prop('items').find((i) => i.id === id);
}
