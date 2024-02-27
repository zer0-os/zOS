import { shallow } from 'enzyme';

import { buttonLabelled, pressButton } from '../../../test/utils';

import { GenerateBackup, Properties } from '.';

import { bem } from '../../../lib/bem';
const c = bem('.secure-backup');

describe(GenerateBackup, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      recoveryKey: 'stub-key',
      errorMessage: '',
      onSave: () => null,
      clipboard: { write: () => Promise.resolve() },
      ...props,
    };

    return shallow(<GenerateBackup {...allProps} />);
  };

  it('renders the recovery key', function () {
    const wrapper = subject({ recoveryKey: 'abcd 1234' });

    expect(wrapper.find(c('recovery-key'))).toHaveText('abcd 1234');
  });

  it('copies the recovery key to the clipboard', function () {
    const clipboard = { write: jest.fn() };
    const wrapper = subject({ clipboard, recoveryKey: 'abcd 1234' });

    pressButton(wrapper, 'Copy');

    expect(clipboard.write).toHaveBeenCalledWith(expect.stringContaining('abcd 1234'));
  });

  it('changes button text to "Copied" after clicking the copy button', async () => {
    const clipboard = { write: jest.fn() };
    const wrapper = subject({ clipboard });

    expect(buttonLabelled(wrapper, 'Copied')).not.toExist();

    pressButton(wrapper, 'Copy');

    expect(buttonLabelled(wrapper, 'Copied')).toExist();
  });

  it('enables the Save Backup button when code has been copied', function () {
    const saveButtonLabel = 'I’ve safely stored my backup';
    const wrapper = subject();

    expect(buttonLabelled(wrapper, saveButtonLabel)).toHaveProp('isDisabled', true);

    pressButton(wrapper, 'Copy');

    expect(buttonLabelled(wrapper, saveButtonLabel)).toHaveProp('isDisabled', false);
  });

  it('publishes onSave event', function () {
    const onSave = jest.fn();
    const wrapper = subject({ onSave });

    pressButton(wrapper, 'Copy');
    pressButton(wrapper, 'I’ve safely stored my backup');

    expect(onSave).toHaveBeenCalledOnce();
  });

  it('renders an error message', () => {
    const wrapper = subject({ errorMessage: 'test-error-message' });

    expect(wrapper.find(c('error-message'))).toHaveText('test-error-message');
  });
});
