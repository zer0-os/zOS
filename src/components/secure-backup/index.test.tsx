import { shallow } from 'enzyme';

import { SecureBackup, Properties } from '.';
import { Alert, Button, Input } from '@zero-tech/zui/components';
import { bem } from '../../lib/bem';
import { buttonLabelled } from '../../test/utils';

const c = bem('.secure-backup');

describe('SecureBackup', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      recoveryKey: 'stub-key',
      backupExists: false,
      isBackupRecovered: false,
      isLegacy: false,
      successMessage: '',
      errorMessage: '',
      onGenerate: () => null,
      onRestore: () => null,
      onSave: () => null,
      onClose: () => null,
      clipboard: { write: () => null },
      ...props,
    };

    return shallow(<SecureBackup {...allProps} />);
  };

  it('generates a backup when Generate is pressed', function () {
    const onGenerate = jest.fn();
    const wrapper = subject({ onGenerate, recoveryKey: '' });

    pressButton(wrapper, 'Generate backup');

    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it('renders the recovery key when in create mode', function () {
    const wrapper = subject({ recoveryKey: 'stuff' });

    expect(wrapper.find(c('recovery-key')).text()).toEqual('stuff');
  });

  it('does not render the recovery key if none is provided', function () {
    const wrapper = subject({ recoveryKey: '' });

    expect(wrapper).not.toHaveElement(c('recovery-key'));
  });

  it('copies the recovery key to the clipboard', function () {
    const clipboard = { write: jest.fn() };
    const wrapper = subject({ clipboard, recoveryKey: '2938 1929' });

    pressButton(wrapper, 'Copy');

    expect(clipboard.write).toHaveBeenCalledWith(expect.stringContaining('2938 1929'));
  });

  it('enables the Save Backup button when code has been copied', function () {
    const wrapper = subject({ recoveryKey: '2938 1929' });

    expect(buttonLabelled(wrapper, 'Save backup').prop('isDisabled')).toBeTrue();
    pressButton(wrapper, 'Copy');

    expect(buttonLabelled(wrapper, 'Save backup').prop('isDisabled')).toBeFalse();
  });

  it('publishes event when Save is clicked', function () {
    const onSave = jest.fn();
    const wrapper = subject({ onSave, recoveryKey: '2938 1929' });

    pressButton(wrapper, 'Copy');
    pressButton(wrapper, 'Save backup');

    expect(onSave).toHaveBeenCalledOnce();
  });

  it('does not show Restore button if backup does not exist', function () {
    const wrapper = subject({ backupExists: false });

    expect(buttonLabelled(wrapper, 'Restore backup').exists()).toBe(false);
  });

  it('publishes event when Restore is clicked', function () {
    const onRestore = jest.fn();
    const wrapper = subject({ onRestore, backupExists: true, recoveryKey: '' });

    changeRecoveryKeyInput(wrapper, 'abcd 1234');
    pressButton(wrapper, 'Restore backup');

    expect(onRestore).toHaveBeenCalledWith('abcd 1234');
  });

  it('renders backed up state if existing backup is fully trusted', function () {
    const onRestore = jest.fn();
    const wrapper = subject({ onRestore, backupExists: true, isBackupRecovered: true, recoveryKey: '' });

    expect(wrapper).toHaveElement(c('backed-up'));
    expect(wrapper).not.toHaveElement(Button);
  });

  it('renders button to generate a new backup if the current one is a legacy backup', function () {
    const onRestore = jest.fn();
    const wrapper = subject({
      onRestore,
      isLegacy: true,
      backupExists: true,
      isBackupRecovered: true,
      recoveryKey: '',
    });

    expect(wrapper).toHaveElement(Button);
  });

  it('renders success message', function () {
    const wrapper = subject({ successMessage: 'It worked!' });

    expect(wrapper.find(Alert).prop('variant')).toEqual('success');
    expect(wrapper.find(Alert).childAt(0).text()).toEqual('It worked!');
  });

  it('renders error message', function () {
    const wrapper = subject({ errorMessage: 'It failed!' });

    expect(wrapper.find(Alert).prop('variant')).toEqual('error');
    expect(wrapper.find(Alert).childAt(0).text()).toEqual('It failed!');
  });
});

function pressButton(wrapper, label: string) {
  buttonLabelled(wrapper, label).simulate('press');
}

function changeRecoveryKeyInput(wrapper, value) {
  wrapper.find(Input).simulate('change', value);
}
