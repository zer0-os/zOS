import { shallow } from 'enzyme';

import { CreateSecureBackup, Properties } from '.';
import { CreateBackupStage } from '../../../store/matrix';
import { GeneratePrompt } from './generate-prompt';
import { GenerateBackup } from './generate-backup';
import { VerifyKeyPhrase } from './verify-key-phrase';
import { Success } from './success';
import { Modal } from '../../modal';
import { LoadingIndicator } from '@zero-tech/zui/components';

describe(CreateSecureBackup, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      recoveryKey: 'stub-key',
      successMessage: '',
      errorMessage: '',
      backupStage: CreateBackupStage.UserGeneratePrompt,
      videoAssetsPath: 'stub-assets-path',

      onGenerate: () => null,
      onSave: () => null,
      onClose: () => null,
      onVerifyKey: () => null,
      ...props,
    };

    return shallow(<CreateSecureBackup {...allProps} />);
  };

  it('renders loading state', async () => {
    const wrapper = subject({ isLoading: true });

    expect(wrapper).toHaveElement(LoadingIndicator);
  });

  describe(GeneratePrompt, () => {
    it('renders GeneratePrompt when stage is SystemGeneratePrompt', function () {
      const wrapper = subject({ backupStage: CreateBackupStage.SystemGeneratePrompt });

      expect(wrapper.find(GeneratePrompt)).toHaveProp('isSystemPrompt', true);
    });

    it('renders GeneratePrompt when stage is UserGeneratePrompt', function () {
      const wrapper = subject({ backupStage: CreateBackupStage.UserGeneratePrompt });

      expect(wrapper.find(GeneratePrompt).prop('isSystemPrompt')).toBeFalsy();
    });

    it('publishes onGenerate for system prompt', function () {
      const onGenerate = jest.fn();
      const wrapper = subject({ backupStage: CreateBackupStage.SystemGeneratePrompt, onGenerate });

      wrapper.find(Modal).simulate('primary');

      expect(onGenerate).toHaveBeenCalled();
    });

    it('publishes onGenerate for user prompt', function () {
      const onGenerate = jest.fn();
      const wrapper = subject({ backupStage: CreateBackupStage.UserGeneratePrompt, onGenerate });

      wrapper.find(Modal).simulate('primary');

      expect(onGenerate).toHaveBeenCalled();
    });

    it('publishes onClose (only valid when in system generated mode)', function () {
      const onClose = jest.fn();
      const wrapper = subject({ backupStage: CreateBackupStage.SystemGeneratePrompt, onClose });

      wrapper.find(Modal).simulate('secondary');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe(GenerateBackup, () => {
    it('renders GenerateBackup component when in GenerateBackup stage', function () {
      const wrapper = subject({ backupStage: CreateBackupStage.GenerateBackup });

      expect(wrapper).toHaveElement(GenerateBackup);
    });

    it('disables button until key copied', function () {
      const wrapper = subject({ backupStage: CreateBackupStage.GenerateBackup });

      expect(wrapper.find(Modal)).toHaveProp('primaryDisabled', true);

      wrapper.find(GenerateBackup).simulate('keyCopied');

      expect(wrapper.find(Modal)).toHaveProp('primaryDisabled', false);
    });

    it('publishes onVerifyKey', function () {
      const onVerifyKey = jest.fn();
      const wrapper = subject({ backupStage: CreateBackupStage.GenerateBackup, onVerifyKey });

      wrapper.find(Modal).simulate('primary');

      expect(onVerifyKey).toHaveBeenCalled();
    });
  });

  describe(Success, () => {
    it('renders Success component when in Success stage', function () {
      const wrapper = subject({ backupStage: CreateBackupStage.Success });
      expect(wrapper).toHaveElement(Success);
    });

    it('renders the success buttons', function () {
      const wrapper = subject({ backupStage: CreateBackupStage.Success });

      expect(wrapper.find(Modal)).toHaveProp('primaryText', 'Finish');
    });

    it('publishes onClose', function () {
      const onClose = jest.fn();
      const wrapper = subject({ backupStage: CreateBackupStage.Success, onClose });

      wrapper.find(Modal).simulate('primary');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe(VerifyKeyPhrase, () => {
    it('renders VerifyKeyPhrase component when in VerifyKeyPhrase stage', function () {
      const wrapper = subject({ backupStage: CreateBackupStage.VerifyKeyPhrase });
      expect(wrapper).toHaveElement(VerifyKeyPhrase);
    });

    it('publishes onGenerate', function () {
      const onGenerate = jest.fn();
      const wrapper = subject({ backupStage: CreateBackupStage.VerifyKeyPhrase, onGenerate });

      wrapper.find(Modal).simulate('secondary');

      expect(onGenerate).toHaveBeenCalled();
    });

    it('publishes onSave', function () {
      const onSave = jest.fn();
      const wrapper = subject({ backupStage: CreateBackupStage.VerifyKeyPhrase, onSave });

      wrapper.find(VerifyKeyPhrase).simulate('change', 'test-key-phrase');
      wrapper.find(Modal).simulate('primary');

      expect(onSave).toHaveBeenCalledWith('test-key-phrase');
    });

    it('disables button if key text is empty and enables when text exists', function () {
      const wrapper = subject({ backupStage: CreateBackupStage.VerifyKeyPhrase });

      expect(wrapper.find(Modal)).toHaveProp('primaryDisabled', true);

      wrapper.find(VerifyKeyPhrase).simulate('change', 't');
      expect(wrapper.find(Modal)).toHaveProp('primaryDisabled', false);

      wrapper.find(VerifyKeyPhrase).simulate('change', '');
      expect(wrapper.find(Modal)).toHaveProp('primaryDisabled', true);
    });
  });
});
