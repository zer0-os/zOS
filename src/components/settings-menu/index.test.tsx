import React from 'react';
import { shallow } from 'enzyme';
import { Properties, SettingsMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';
import { EditProfileContainer } from '../edit-profile/container';
import { SecureBackupContainer } from '../secure-backup/container';
import { selectDropdownItem } from '../../test/utils';

describe('settings-menu', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      userName: '',
      userHandle: '',
      userAvatarUrl: '',
      userStatus: 'active',
      onLogout: () => {},

      ...props,
    };

    return shallow(<SettingsMenu {...allProps} />);
  };

  it('opens profile dialog', function () {
    const wrapper = subject({});

    selectDropdownItem(wrapper, DropdownMenu, 'edit_profile');

    expect(wrapper.find(EditProfileContainer).parent().prop('open')).toBe(true);
  });

  it('opens secure backup dialog', function () {
    const wrapper = subject({});

    selectDropdownItem(wrapper, DropdownMenu, 'secure_backup');

    expect(wrapper.find(SecureBackupContainer).parent().prop('open')).toBe(true);
  });

  it('calls onLogout prop when logout item is selected', function () {
    const mockOnLogout = jest.fn();
    const wrapper = subject({ onLogout: mockOnLogout });

    selectDropdownItem(wrapper, DropdownMenu, 'logout');

    expect(mockOnLogout).toHaveBeenCalled();
  });
});
