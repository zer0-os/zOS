import { shallow } from 'enzyme';

import { SecureBackup, Properties } from '.';
import { BackupStage } from '../../store/matrix';
import { GeneratePrompt } from './generate-prompt';
import { RestorePrompt } from './restore-prompt';
import { RecoveredBackup } from './recovered-backup';
import { GenerateBackup } from './generate-backup';
import { RestoreBackup } from './restore-backup';
import { VerifyKeyPhrase } from './verify-key-phrase';
import { Success } from './success';
import { Modal } from '../modal';

describe(SecureBackup, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      recoveryKey: 'stub-key',
      backupExists: false,
      backupRestored: false,
      successMessage: '',
      errorMessage: '',
      backupStage: BackupStage.UserGeneratePrompt,

      onGenerate: () => null,
      onRestore: () => null,
      onSave: () => null,
      onClose: () => null,
      onVerifyKey: () => null,
      videoAssetsPath: 'stub-assets-path',
      ...props,
    };

    return shallow(<SecureBackup {...allProps} />);
  };

  describe(GeneratePrompt, () => {
    it('renders GeneratePrompt when stage is SystemGeneratePrompt', function () {
      const wrapper = subject({ backupStage: BackupStage.SystemGeneratePrompt });

      expect(wrapper.find(GeneratePrompt)).toHaveProp('isSystemPrompt', true);
    });

    it('renders GeneratePrompt when stage is UserGeneratePrompt', function () {
      const wrapper = subject({ backupStage: BackupStage.UserGeneratePrompt });

      expect(wrapper.find(GeneratePrompt).prop('isSystemPrompt')).toBeFalsy();
    });

    it('publishes onGenerate for system prompt', function () {
      const onGenerate = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.SystemGeneratePrompt, onGenerate });

      wrapper.find(GeneratePrompt).simulate('generate');

      expect(onGenerate).toHaveBeenCalled();
    });

    it('publishes onGenerate for user prompt', function () {
      const onGenerate = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.UserGeneratePrompt, onGenerate });

      wrapper.find(GeneratePrompt).simulate('generate');

      expect(onGenerate).toHaveBeenCalled();
    });

    it('publishes onClose (only valid when in system generated mode)', function () {
      const onClose = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.SystemGeneratePrompt, onClose });

      wrapper.find(GeneratePrompt).simulate('close');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe(RestorePrompt, () => {
    it('renders RestorePrompt when stage is SystemRestorePrompt', function () {
      const wrapper = subject({ backupStage: BackupStage.SystemRestorePrompt });

      expect(wrapper.find(RestorePrompt)).toHaveProp('isSystemPrompt', true);
    });

    it('renders RestorePrompt when stage is UserRestoreBackup', function () {
      const wrapper = subject({ backupStage: BackupStage.UserRestorePrompt });

      expect(wrapper.find(RestorePrompt).prop('isSystemPrompt')).toBeFalsy();
    });

    it('publishes onVerifyKey (system)', function () {
      const onVerifyKey = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.SystemRestorePrompt, onVerifyKey });

      wrapper.find(Modal).simulate('primary');

      expect(onVerifyKey).toHaveBeenCalled();
    });

    it('publishes onVerifyKey (user)', function () {
      const onVerifyKey = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.UserRestorePrompt, onVerifyKey });

      wrapper.find(Modal).simulate('primary');

      expect(onVerifyKey).toHaveBeenCalled();
    });

    it('publishes onClose, (when backup stage is SystemPrompt)', function () {
      const onClose = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.SystemRestorePrompt, onClose });

      wrapper.find(Modal).simulate('secondary');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe(RecoveredBackup, () => {
    it('renders RecoveredBackup when stage is RecoveredBackupInfo', function () {
      const wrapper = subject({ backupStage: BackupStage.RecoveredBackupInfo });

      expect(wrapper).toHaveElement(RecoveredBackup);
    });

    it('renders the buttons', function () {
      const wrapper = subject({ backupStage: BackupStage.RecoveredBackupInfo });

      expect(wrapper.find(Modal)).toHaveProp('primaryText', 'Dismiss');
    });

    it('publishes onClose', function () {
      const onClose = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.RecoveredBackupInfo, onClose });

      wrapper.find(Modal).simulate('close');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe(GenerateBackup, () => {
    it('renders GenerateBackup component when in GenerateBackup stage', function () {
      const wrapper = subject({ backupStage: BackupStage.GenerateBackup });

      expect(wrapper).toHaveElement(GenerateBackup);
    });

    it('publishes onVerifyKey', function () {
      const onVerifyKey = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.GenerateBackup, onVerifyKey });

      wrapper.find(GenerateBackup).simulate('next');

      expect(onVerifyKey).toHaveBeenCalled();
    });
  });

  describe(RestoreBackup, () => {
    it('renders RestoreBackup component when in RestoreBackup stage', function () {
      const wrapper = subject({ backupStage: BackupStage.RestoreBackup });

      expect(wrapper).toHaveElement(RestoreBackup);
    });

    it('publishes onRestore', function () {
      const onRestore = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.RestoreBackup, onRestore });

      wrapper.find(RestoreBackup).simulate('restore', 'abcd 1234');

      expect(onRestore).toHaveBeenCalledWith('abcd 1234');
    });
  });

  describe(Success, () => {
    it('renders Success component when in Success stage', function () {
      const wrapper = subject({ backupStage: BackupStage.Success });
      expect(wrapper).toHaveElement(Success);
    });

    it('renders the success buttons', function () {
      const wrapper = subject({ backupStage: BackupStage.Success });

      expect(wrapper.find(Modal)).toHaveProp('primaryText', 'Finish');
    });

    it('publishes onClose', function () {
      const onClose = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.Success, onClose });

      wrapper.find(Modal).simulate('primary');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe(VerifyKeyPhrase, () => {
    it('renders VerifyKeyPhrase component when in VerifyKeyPhrase stage', function () {
      const wrapper = subject({ backupStage: BackupStage.VerifyKeyPhrase });
      expect(wrapper).toHaveElement(VerifyKeyPhrase);
    });

    it('publishes onGenerate', function () {
      const onGenerate = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.VerifyKeyPhrase, onGenerate });

      wrapper.find(VerifyKeyPhrase).simulate('back');

      expect(onGenerate).toHaveBeenCalled();
    });

    it('publishes onSave', function () {
      const onSave = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.VerifyKeyPhrase, onSave });

      wrapper.find(VerifyKeyPhrase).simulate('save', 'abcd 1234');

      expect(onSave).toHaveBeenCalled();
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
