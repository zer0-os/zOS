import { shallow } from 'enzyme';

import { SecureBackup, Properties } from '.';
import { BackupStage } from '../../store/matrix';
import { GeneratePrompt } from './generate-prompt';
import { RestorePrompt } from './restore-prompt';
import { RecoveredBackup } from './recovered-backup';
import { GenerateBackup } from './generate-backup';
import { RestoreBackup } from './restore-backup';
import { Success } from './success';

describe('SecureBackup', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      recoveryKey: 'stub-key',
      backupExists: false,
      isBackupRecovered: false,
      isLegacy: false,
      successMessage: '',
      errorMessage: '',
      backupStage: BackupStage.None,

      onGenerate: () => null,
      onRestore: () => null,
      onSave: () => null,
      onClose: () => null,
      onVerifyKey: () => null,
      clipboard: { write: () => null },
      videoAssetsPath: 'stub-assets-path',
      ...props,
    };

    return shallow(<SecureBackup {...allProps} />);
  };

  describe(GeneratePrompt, () => {
    it('renders GeneratePrompt when stage is None, backup does not exists and no recovery key', function () {
      const wrapper = subject({ backupStage: BackupStage.None, backupExists: false, recoveryKey: '' });

      expect(wrapper).toHaveElement(GeneratePrompt);
    });

    it('renders GeneratePrompt when stage is SystemPrompt, backup does not exists and no recovery key', function () {
      const wrapper = subject({ backupStage: BackupStage.SystemPrompt, backupExists: false, recoveryKey: '' });

      expect(wrapper).toHaveElement(GeneratePrompt);
    });

    it('publishes onGenerate', function () {
      const onGenerate = jest.fn();
      const wrapper = subject({
        backupStage: BackupStage.SystemPrompt,
        backupExists: false,
        recoveryKey: '',
        onGenerate,
      });

      wrapper.find(GeneratePrompt).simulate('generate');

      expect(onGenerate).toHaveBeenCalled();
    });

    it('publishes onClose (when backup stage is SystemPrompt)', function () {
      const onClose = jest.fn();
      const wrapper = subject({
        backupStage: BackupStage.SystemPrompt,
        backupExists: false,
        recoveryKey: '',
        onClose,
      });

      wrapper.find(GeneratePrompt).simulate('close');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe(RestorePrompt, () => {
    it('renders RestorePrompt when stage is None, backup exists, backup not restored and recovery key exists', function () {
      const wrapper = subject({
        backupStage: BackupStage.None,
        backupExists: true,
        isBackupRecovered: false,
        recoveryKey: 'key',
      });

      expect(wrapper).toHaveElement(RestorePrompt);
    });

    it('renders RestorePrompt when stage is SystemPrompt, backup exists, backup not restored and recovery key exists', function () {
      const wrapper = subject({
        backupStage: BackupStage.SystemPrompt,
        backupExists: true,
        isBackupRecovered: false,
        recoveryKey: 'key',
      });

      expect(wrapper).toHaveElement(RestorePrompt);
    });

    it('publishes onVerifyKey', function () {
      const onVerifyKey = jest.fn();
      const wrapper = subject({
        backupStage: BackupStage.SystemPrompt,
        backupExists: true,
        isBackupRecovered: false,
        recoveryKey: 'key',
        onVerifyKey,
      });

      wrapper.find(RestorePrompt).simulate('verifyKey');

      expect(onVerifyKey).toHaveBeenCalled();
    });

    it('publishes onClose, (when backup stage is SystemPrompt)', function () {
      const onClose = jest.fn();
      const wrapper = subject({
        backupStage: BackupStage.SystemPrompt,
        backupExists: true,
        isBackupRecovered: false,
        recoveryKey: 'key',
        onClose,
      });

      wrapper.find(RestorePrompt).simulate('close');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe(RecoveredBackup, () => {
    it('renders RecoveredBackup when stage is None, backup is recovered, backup exists and no recovery key', function () {
      const wrapper = subject({
        backupStage: BackupStage.None,
        backupExists: true,
        isBackupRecovered: true,
        recoveryKey: '',
      });

      expect(wrapper).toHaveElement(RecoveredBackup);
    });

    it('publishes onClose', function () {
      const onClose = jest.fn();
      const wrapper = subject({
        backupStage: BackupStage.None,
        backupExists: true,
        isBackupRecovered: true,
        recoveryKey: '',
        onClose,
      });

      wrapper.find(RecoveredBackup).simulate('close');

      expect(onClose).toHaveBeenCalled();
    });

    it('publishes onGenerate when isLegacy is true', function () {
      const onGenerate = jest.fn();
      const wrapper = subject({
        backupStage: BackupStage.None,
        backupExists: true,
        isBackupRecovered: true,
        recoveryKey: '',
        onGenerate,
        isLegacy: true,
      });

      wrapper.find(RecoveredBackup).simulate('generate');

      expect(onGenerate).toHaveBeenCalled();
    });
  });

  describe(GenerateBackup, () => {
    it('renders GenerateBackup component when in GenerateBackup stage', function () {
      const wrapper = subject({ backupStage: BackupStage.GenerateBackup });

      expect(wrapper).toHaveElement(GenerateBackup);
    });

    it('publishes onSave', function () {
      const onSave = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.GenerateBackup, onSave });

      wrapper.find(GenerateBackup).simulate('save');

      expect(onSave).toHaveBeenCalled();
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

    it('publishes onClose', function () {
      const onClose = jest.fn();
      const wrapper = subject({ backupStage: BackupStage.Success, onClose });

      wrapper.find(Success).simulate('close');

      expect(onClose).toHaveBeenCalled();
    });
  });
});
