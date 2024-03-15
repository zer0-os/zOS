import { shallow } from 'enzyme';

import { RestorePrompt, Properties } from '.';

import { bem } from '../../../lib/bem';
const c = bem('.secure-backup');

describe(RestorePrompt, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isSystemPrompt: false,
      onLearnMore: () => null,
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

  it('publishes onLearnMore event', function () {
    const onLearnMore = jest.fn();
    const wrapper = subject({ onLearnMore });

    wrapper.find(c('learn-more')).simulate('click');

    expect(onLearnMore).toHaveBeenCalledOnce();
  });
});
