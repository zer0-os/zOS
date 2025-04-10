import { shallow } from 'enzyme';

import { RestoreSecureBackup, Properties } from '.';
import { RestoreBackupStage } from '../../../store/matrix';
import { RestorePrompt } from './restore-prompt';
import { RecoveredBackup } from './recovered-backup';
import { RestoreBackup } from './restore-backup';
import { Success } from './success';
import { Modal } from '../../modal';
import { LoadingIndicator } from '@zero-tech/zui/components';

describe(RestoreSecureBackup, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      backupExists: false,
      backupRestored: false,
      successMessage: '',
      errorMessage: '',
      backupStage: RestoreBackupStage.UserRestorePrompt,
      restoreProgress: { stage: '', total: 0, successes: 0, failures: 0 },
      videoAssetsPath: 'stub-assets-path',

      onRestore: () => null,
      onClose: () => null,
      onVerifyKey: () => null,
      ...props,
    };

    return shallow(<RestoreSecureBackup {...allProps} />);
  };

  it('renders loading state', async () => {
    const wrapper = subject({ isLoading: true });

    expect(wrapper).toHaveElement(LoadingIndicator);
  });

  describe(RestorePrompt, () => {
    it('renders RestorePrompt when stage is SystemRestorePrompt', function () {
      const wrapper = subject({ backupStage: RestoreBackupStage.SystemRestorePrompt });

      expect(wrapper.find(RestorePrompt)).toHaveProp('isSystemPrompt', true);
    });

    it('renders RestorePrompt when stage is UserRestoreBackup', function () {
      const wrapper = subject({ backupStage: RestoreBackupStage.UserRestorePrompt });

      expect(wrapper.find(RestorePrompt).prop('isSystemPrompt')).toBeFalsy();
    });

    it('publishes onVerifyKey (system)', function () {
      const onVerifyKey = jest.fn();
      const wrapper = subject({ backupStage: RestoreBackupStage.SystemRestorePrompt, onVerifyKey });

      wrapper.find(Modal).simulate('primary');

      expect(onVerifyKey).toHaveBeenCalled();
    });

    it('publishes onVerifyKey (user)', function () {
      const onVerifyKey = jest.fn();
      const wrapper = subject({ backupStage: RestoreBackupStage.UserRestorePrompt, onVerifyKey });

      wrapper.find(Modal).simulate('primary');

      expect(onVerifyKey).toHaveBeenCalled();
    });

    it('publishes onClose, (when backup stage is SystemPrompt)', function () {
      const onClose = jest.fn();
      const wrapper = subject({ backupStage: RestoreBackupStage.SystemRestorePrompt, onClose });

      wrapper.find(Modal).simulate('secondary');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe(RecoveredBackup, () => {
    it('renders RecoveredBackup when stage is RecoveredBackupInfo', function () {
      const wrapper = subject({ backupStage: RestoreBackupStage.RecoveredBackupInfo });

      expect(wrapper).toHaveElement(RecoveredBackup);
    });

    it('renders the buttons', function () {
      const wrapper = subject({ backupStage: RestoreBackupStage.RecoveredBackupInfo });

      expect(wrapper.find(Modal)).toHaveProp('primaryText', 'Dismiss');
    });

    it('publishes onClose', function () {
      const onClose = jest.fn();
      const wrapper = subject({ backupStage: RestoreBackupStage.RecoveredBackupInfo, onClose });

      wrapper.find(Modal).simulate('close');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe(RestoreBackup, () => {
    it('renders RestoreBackup component when in RestoreBackup stage', function () {
      const wrapper = subject({ backupStage: RestoreBackupStage.RestoreBackup });

      expect(wrapper).toHaveElement(RestoreBackup);
    });

    it('publishes onRestore', function () {
      const onRestore = jest.fn();
      const wrapper = subject({ backupStage: RestoreBackupStage.RestoreBackup, onRestore });

      wrapper.find(RestoreBackup).simulate('change', 'abcd 1234');
      wrapper.find(Modal).simulate('primary');

      expect(onRestore).toHaveBeenCalledWith('abcd 1234');
    });

    it('disables button if key text is empty and enables when text exists', function () {
      const wrapper = subject({ backupStage: RestoreBackupStage.RestoreBackup });

      expect(wrapper.find(Modal)).toHaveProp('primaryDisabled', true);

      wrapper.find(RestoreBackup).simulate('change', 't');
      expect(wrapper.find(Modal)).toHaveProp('primaryDisabled', false);

      wrapper.find(RestoreBackup).simulate('change', '');
      expect(wrapper.find(Modal)).toHaveProp('primaryDisabled', true);
    });
  });

  describe(Success, () => {
    it('renders Success component when in Success stage', function () {
      const wrapper = subject({ backupStage: RestoreBackupStage.Success });
      expect(wrapper).toHaveElement(Success);
    });

    it('renders the success buttons', function () {
      const wrapper = subject({ backupStage: RestoreBackupStage.Success });

      expect(wrapper.find(Modal)).toHaveProp('primaryText', 'Finish');
    });

    it('publishes onClose', function () {
      const onClose = jest.fn();
      const wrapper = subject({ backupStage: RestoreBackupStage.Success, onClose });

      wrapper.find(Modal).simulate('primary');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('header container', () => {
    it('renders title as "Account Backup" if backup does not exist and backup is not restored', function () {
      const wrapper = subject({ backupExists: false, backupRestored: false });

      expect(wrapper.find(Modal)).toHaveProp('title', 'Account Backup');
    });

    it('renders title as "Verify Login" if backup exists and backup is not restored', function () {
      const wrapper = subject({ backupExists: true, backupRestored: false });

      expect(wrapper.find(Modal)).toHaveProp('title', 'Verify Login');
    });
  });
});
