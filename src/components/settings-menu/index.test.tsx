import React from 'react';
import { shallow } from 'enzyme';
import { Properties, SettingsMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';
import { EditProfileContainer } from '../edit-profile/container';
import { selectDropdownItem } from '../../test/utils';

describe('settings-menu', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      userName: '',
      userHandle: '',
      userAvatarUrl: '',
      userStatus: 'active',
      onLogout: () => {},
      onSecureBackup: () => {},

      ...props,
    };

    return shallow(<SettingsMenu {...allProps} />);
  };

  it('opens profile dialog', function () {
    const wrapper = subject({});

    selectDropdownItem(wrapper, DropdownMenu, 'edit_profile');

    expect(wrapper.find(EditProfileContainer).parent().prop('open')).toBe(true);
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
});
