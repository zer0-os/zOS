import { shallow } from 'enzyme';

import { buttonLabelled, pressButton } from '../../../test/utils';
import { GeneratePrompt, Properties } from '.';

import { bem } from '../../../lib/bem';
const c = bem('.secure-backup');

describe(GeneratePrompt, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isSystemPrompt: false,
      errorMessage: '',
      onGenerate: () => null,
      onClose: () => null,
      ...props,
    };

    return shallow(<GeneratePrompt {...allProps} />);
  };

  it('renders the primary text when isSystemPrompt is true', function () {
    const wrapper = subject({ isSystemPrompt: true });

    const expectedText =
      'Now that you’re messaging, we strongly advise that you backup your account to prevent losing access to your messages';

    expect(wrapper.find(c('primary-text'))).toHaveText(expectedText);
  });

  it('renders the primary text when isSystemPrompt is false', function () {
    const wrapper = subject({ isSystemPrompt: false });

    const expectedText = 'Access your encrypted messages between devices and logins with an account backup.';

    expect(wrapper.find(c('primary-text'))).toHaveText(expectedText);
  });

  it('shows the secondary button when isSystemPrompt is true', function () {
    const wrapper = subject({ isSystemPrompt: true });

    expect(buttonLabelled(wrapper, 'Backup later')).toExist();
  });

  it('does not show the secondary button when isSystemPrompt is false', function () {
    const wrapper = subject({ isSystemPrompt: false });

    expect(buttonLabelled(wrapper, 'Backup later')).not.toExist();
  });

  it('publishes onGenerate event', function () {
    const onGenerate = jest.fn();
    const wrapper = subject({ onGenerate });

    pressButton(wrapper, 'Backup my account');

    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it('publishes onClose event when isSystemPrompt is true', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose, isSystemPrompt: true });

    pressButton(wrapper, 'Backup later');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders an error message', () => {
    const wrapper = subject({ errorMessage: 'test-error-message' });

    expect(wrapper.find(c('error-message'))).toHaveText('test-error-message');
  });
});
