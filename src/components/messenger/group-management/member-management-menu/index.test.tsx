import React from 'react';
import { shallow } from 'enzyme';
import { Properties, MemberManagementMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';
import { MemberManagementAction } from '../../../../store/group-management';

describe(MemberManagementMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      canRemove: true,
      onOpenChange: () => {},
      onOpenMemberManagement: () => {},
      ...props,
    };

    return shallow(<MemberManagementMenu {...allProps} />);
  };

  it('does not render the menu if user cannot do anything', function () {
    const wrapper = subject({
      canRemove: false,
    });

    expect(wrapper).not.toHaveElement(DropdownMenu);
  });

  describe('Remove', () => {
    it('publishes onRemoveMember event when Remove member is clicked', () => {
      const onOpenMemberManagement = jest.fn();
      const wrapper = subject({ onOpenMemberManagement, canRemove: true });

      selectItem(wrapper, 'remove-member');

      expect(onOpenMemberManagement).toBeCalledWith(MemberManagementAction.RemoveMember);
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
