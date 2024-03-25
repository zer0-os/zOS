import React from 'react';
import { shallow } from 'enzyme';
import { Properties, SettingsMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';
import { EditProfileContainer } from '../edit-profile/container';
import { selectDropdownItem } from '../../test/utils';

const featureFlags = { enableRewards: false };
jest.mock('../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe('settings-menu', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      userName: '',
      userHandle: '',
      userAvatarUrl: '',
      userStatus: 'active',
      hasUnviewedRewards: false,
      onOpen: () => null,
      onLogout: () => {},
      onSecureBackup: () => {},
      onRewards: () => {},

      ...props,
    };

    return shallow(<SettingsMenu {...allProps} />);
  };

  it('opens profile dialog', function () {
    const wrapper = subject({});

    selectDropdownItem(wrapper, DropdownMenu, 'edit_profile');

    expect(wrapper.find(EditProfileContainer).parent().prop('open')).toBe(true);
  });

  it('fires rewards selected event', function () {
    featureFlags.enableRewards = true;
    const onRewards = jest.fn();
    const wrapper = subject({ onRewards });

    selectDropdownItem(wrapper, DropdownMenu, 'rewards');

    expect(onRewards).toHaveBeenCalled();
  });

  it('fires secure backup selected event', function () {
    const onSecureBackup = jest.fn();
    const wrapper = subject({ onSecureBackup });

    selectDropdownItem(wrapper, DropdownMenu, 'secure_backup');

    expect(onSecureBackup).toHaveBeenCalled();
  });

  it('calls onLogout prop when logout item is selected', function () {
    const mockOnLogout = jest.fn();
    const wrapper = subject({ onLogout: mockOnLogout });

    selectDropdownItem(wrapper, DropdownMenu, 'logout');

    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('sets the avatar active when the dropdown is open', function () {
    const wrapper = subject({ hasUnviewedRewards: false });

    wrapper.find(DropdownMenu).simulate('openChange', true);

    const dropdown = wrapper.find(DropdownMenu);
    expect((dropdown.prop('trigger') as any).props.isActive).toEqual(true);
  });

  it('sets the avatar active if the user has unviewed rewards', function () {
    const wrapper = subject({ hasUnviewedRewards: true });

    const dropdown = wrapper.find(DropdownMenu);
    expect((dropdown.prop('trigger') as any).props.isActive).toEqual(true);
  });

  it('calls onOpen prop when the menu is opened', function () {
    const onOpen = jest.fn();
    const wrapper = subject({ onOpen });

    wrapper.find(DropdownMenu).simulate('openChange', true);

    expect(onOpen).toHaveBeenCalled();
  });
});
