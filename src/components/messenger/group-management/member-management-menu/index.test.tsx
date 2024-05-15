import React from 'react';
import { shallow } from 'enzyme';
import { Properties, MemberManagementMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';

describe(MemberManagementMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      canRemove: true,
      onOpenChange: () => {},
      onRemoveMember: () => {},
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
      const onRemoveMember = jest.fn();
      const wrapper = subject({ onRemoveMember, canRemove: true });

      selectItem(wrapper, 'remove-member');

      expect(onRemoveMember).toHaveBeenCalled();
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
