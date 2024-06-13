import { shallow } from 'enzyme';

import { UserProfile, Properties } from '.';
import { Stage } from '../../../store/user-profile';
import { OverviewPanel } from './overview-panel';
import { EditProfileContainer } from '../../edit-profile/container';
import { SettingsPanelContainer } from './settings-panel/container';
import { AccountManagementContainer } from './account-management-panel/container';

describe(UserProfile, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      stage: Stage.Overview,
      name: '',
      image: '',
      subHandle: '',

      onClose: () => {},
      onLogout: () => {},
      onBackup: () => {},
      onEdit: () => {},
      onBackToOverview: () => {},
      onRewards: () => {},
      onSettings: () => {},
      onManageAccounts: () => {},
      ...props,
    };

    return shallow(<UserProfile {...allProps} />);
  };

  it('renders Overview Panel when stage is Overview', () => {
    const wrapper = subject({ stage: Stage.Overview });

    expect(wrapper).toHaveElement(OverviewPanel);
  });

  it('renders Edit Profile when stage is EditProfile', () => {
    const wrapper = subject({ stage: Stage.EditProfile });

    expect(wrapper).toHaveElement(EditProfileContainer);
  });

  it('renders Settings Panel Container when stage is Settings', () => {
    const wrapper = subject({ stage: Stage.Settings });

    expect(wrapper).toHaveElement(SettingsPanelContainer);
  });

  it('renders Wallets Panel Container when stage is Wallets', () => {
    const wrapper = subject({ stage: Stage.AccountManagement });

    expect(wrapper).toHaveElement(AccountManagementContainer);
  });

  it('renders nothing when stage None', () => {
    const wrapper = subject({ stage: Stage.None });

    expect(wrapper).not.toHaveElement(OverviewPanel);
    expect(wrapper).not.toHaveElement(EditProfileContainer);
  });
});
