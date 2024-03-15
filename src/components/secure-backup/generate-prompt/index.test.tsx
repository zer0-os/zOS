import { shallow } from 'enzyme';

import { GeneratePrompt, Properties } from '.';

import { bem } from '../../../lib/bem';
const c = bem('.secure-backup');

describe(GeneratePrompt, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isSystemPrompt: false,
      errorMessage: '',
      onLearnMore: () => null,
      ...props,
    };

    return shallow(<GeneratePrompt {...allProps} />);
  };

  it('renders the expected primary text when isSystemPrompt is true', function () {
    const wrapper = subject({ isSystemPrompt: true });

    const expectedText =
      'Now that you’re messaging, we strongly advise that you backup your account to prevent losing access to your messages';

    expect(wrapper.find(c('primary-text'))).toHaveText(expectedText);
  });

  it('renders the expected primary text when isSystemPrompt is false', function () {
    const wrapper = subject({ isSystemPrompt: false });

    const expectedText = 'Access your encrypted messages between devices and logins with an account backup.';

    expect(wrapper.find(c('primary-text'))).toHaveText(expectedText);
  });

  it('renders an error message', () => {
    const wrapper = subject({ errorMessage: 'test-error-message' });

    expect(wrapper.find(c('error-message'))).toHaveText('test-error-message');
  });

  it('does not render an error message if none provided', () => {
    const wrapper = subject({ errorMessage: '' });

    expect(wrapper.find(c('error-message'))).not.toExist();
  });

  it('publishes onLearnMore event', function () {
    const onLearnMore = jest.fn();
    const wrapper = subject({ onLearnMore });

    wrapper.find(c('learn-more')).simulate('click');

    expect(onLearnMore).toHaveBeenCalledOnce();
  });
});
