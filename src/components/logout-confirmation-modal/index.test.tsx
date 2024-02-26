import { shallow } from 'enzyme';

import { LogoutConfirmationModal, Properties } from '.';

describe(LogoutConfirmationModal, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      backupExists: false,
      backupVerified: false,
      ...props,
    };

    return shallow(<LogoutConfirmationModal {...allProps} />);
  };

  it('renders the no-backup-text if a user does not have a backup', function () {
    const wrapper = subject({ backupExists: false });

    expect(wrapper.find('div').text()).toMatch('You have not created');
  });

  it('renders the unverified-text if a user has a backup but it is not verified', function () {
    const wrapper = subject({ backupExists: true, backupVerified: false });

    expect(wrapper.find('div').text()).toMatch('You have not verified');
  });

  it('renders the logout-warning-text if the user has a backup and is verified', function () {
    const wrapper = subject({ backupExists: true, backupVerified: true });

    expect(wrapper.find('div').text()).toMatch('You will need to enter');
  });
});
