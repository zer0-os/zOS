import React from 'react';
import { shallow } from 'enzyme';
import { Properties, MemberManagementMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';
import { MemberManagementAction } from '../../../../store/group-management';

const featureFlags = { allowModeratorActions: true };

jest.mock('../../../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe(MemberManagementMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      canRemove: true,
      onOpenChange: () => {},
      onOpenMemberManagement: () => {},
      allowModeratorManagement: true,
      ...props,
    };

    return shallow(<MemberManagementMenu {...allProps} />);
  };

  it('renders Make Mod menu item when user is NOT a moderator', () => {
    const wrapper = subject({ isUserModerator: false });
    expect(menuItem(wrapper, 'make-mod')).toBeDefined();
    expect(menuItem(wrapper, 'remove-mod')).toBeUndefined();
  });

  it('renders Remove Mod menu item when user is a moderator', () => {
    const wrapper = subject({ isUserModerator: true });
    expect(menuItem(wrapper, 'remove-mod')).toBeDefined();
    expect(menuItem(wrapper, 'make-mod')).toBeUndefined();
  });

  it('does not render Make/Remove Mod menu item when moderator actions are not allowed', () => {
    featureFlags.allowModeratorActions = false;
    const wrapper = subject({ allowModeratorManagement: false });
    expect(menuItem(wrapper, 'make-mod')).toBeUndefined();
    expect(menuItem(wrapper, 'remove-mod')).toBeUndefined();
  });

  describe('Member Management Actions', () => {
    it('publishes onRemoveMember event when Remove member is clicked', () => {
      const onOpenMemberManagement = jest.fn();
      const wrapper = subject({ onOpenMemberManagement, canRemove: true });

      selectItem(wrapper, 'remove-member');

      expect(onOpenMemberManagement).toBeCalledWith(MemberManagementAction.RemoveMember);
    });

    it('publishes onMakeMod event when Make Mod is clicked', () => {
      featureFlags.allowModeratorActions = true;

      const onOpenMemberManagement = jest.fn();
      const wrapper = subject({ onOpenMemberManagement });

      selectItem(wrapper, 'make-mod');

      expect(onOpenMemberManagement).toBeCalledWith(MemberManagementAction.MakeModerator);
    });

    it('publishes onRemoveMod event when Remove Mod is clicked', () => {
      const onOpenMemberManagement = jest.fn();
      const wrapper = subject({ onOpenMemberManagement, isUserModerator: true });

      selectItem(wrapper, 'remove-mod');

      expect(onOpenMemberManagement).toBeCalledWith(MemberManagementAction.RemoveModerator);
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
