import { shallow } from 'enzyme';

import { buttonLabelled, pressButton } from '../../../test/utils';
import { RestorePrompt, Properties } from '.';

import { bem } from '../../../lib/bem';
const c = bem('.secure-backup');

describe(RestorePrompt, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isSystemPrompt: false,
      onNext: () => null,
      onClose: () => null,
      ...props,
    };

    return shallow(<RestorePrompt {...allProps} />);
  };

  it('renders the expected primary text when isSystemPrompt is true', function () {
    const wrapper = subject({ isSystemPrompt: true });

    const expectedText =
      'It looks like this is a new device or login. Enter your account backup phrase to maintain access to your messages.';

    expect(wrapper.find(c('primary-text'))).toHaveText(expectedText);
  });

  it('renders the expected primary text when isSystemPrompt is false', function () {
    const wrapper = subject({ isSystemPrompt: false });

    const expectedText = 'Access your encrypted messages between devices and logins with an account backup.';

    expect(wrapper.find(c('primary-text'))).toHaveText(expectedText);
  });

  it('publishes onNext event', function () {
    const onNext = jest.fn();
    const wrapper = subject({ onNext });

    pressButton(wrapper, 'Verify with backup phrase');

    expect(onNext).toHaveBeenCalledOnce();
  });

  it('publishes onClose event when isSystemPrompt is true', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose, isSystemPrompt: true });

    pressButton(wrapper, 'Continue without verifying');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not render / publish the secondary button when isSystemPrompt is false', function () {
    const wrapper = subject({ isSystemPrompt: false });

    expect(buttonLabelled(wrapper, 'Continue without verifying')).not.toExist();
  });

  it('applies the has-secondary-button class when isSystemPrompt is true', function () {
    const wrapper = subject({ isSystemPrompt: true });

    expect(wrapper.find(c('footer--has-secondary-button'))).toExist();
  });

  it('does not apply the has-secondary-button class when isSystemPrompt is false', function () {
    const wrapper = subject({ isSystemPrompt: false });

    expect(wrapper.find(c('footer--has-secondary-button'))).not.toExist();
  });
});
