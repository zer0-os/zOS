import React from 'react';
import { shallow } from 'enzyme';
import { Properties, SettingsMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';

describe('settings-menu', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      userName: '',
      userHandle: '',
      userAvatarUrl: '',
      onLogout: () => {},

      ...props,
    };

    return shallow(<SettingsMenu {...allProps} />);
  };

  it('renders DropdownMenu component', function () {
    const wrapper = subject({});

    expect(wrapper).toHaveElement(DropdownMenu);
  });

  it('calls onLogout prop when logout item is selected', function () {
    const wrapper = subject({});
    const dropdownMenu = wrapper.find(DropdownMenu);
    expect(wrapper.state('editProfileDialogOpen')).toBe(false);

    const editProfileItem = dropdownMenu.prop('items').find((item) => item.id === 'edit_profile');
    editProfileItem.onSelect();
    expect(wrapper.state('editProfileDialogOpen')).toBe(true);
  });

  it('calls onLogout prop when logout item is selected', function () {
    const mockOnLogout = jest.fn();
    const wrapper = subject({ onLogout: mockOnLogout });
    const dropdownMenu = wrapper.find(DropdownMenu);

    const logoutItem = dropdownMenu.prop('items').find((item) => item.id === 'logout');
    logoutItem.onSelect();
    expect(mockOnLogout).toHaveBeenCalled();
  });
});
