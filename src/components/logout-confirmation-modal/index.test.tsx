import { shallow } from 'enzyme';

import { LogoutConfirmationModal, Properties } from '.';
import { Modal } from '../modal';

describe(LogoutConfirmationModal, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      backupExists: false,
      backupRestored: false,
      onClose: () => null,
      onLogout: () => null,
      ...props,
    };

    return shallow(<LogoutConfirmationModal {...allProps} />);
  };

  it('renders the no-backup-text if a user does not have a backup', function () {
    const wrapper = subject({ backupExists: false });

    expect(wrapper.find('div').text()).toMatch('You have not created');
  });

  it('renders the unverified-text if a user has a backup but it is not verified', function () {
    const wrapper = subject({ backupExists: true, backupRestored: false });

    expect(wrapper.find('div').text()).toMatch('You have not verified');
  });

  it('renders the logout-warning-text if the user has a backup and is verified', function () {
    const wrapper = subject({ backupExists: true, backupRestored: true });

    expect(wrapper.find('div').text()).toMatch('You will need to enter');
  });

  it('publishes close event on secondary action', async () => {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(Modal).simulate('secondary');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes close event on close action', async () => {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(Modal).simulate('close');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes logout event', async () => {
    const onLogout = jest.fn();
    const wrapper = subject({ onLogout });

    wrapper.find(Modal).simulate('primary');

    expect(onLogout).toHaveBeenCalled();
  });
});
