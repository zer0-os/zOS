import { shallow } from 'enzyme';
import { Properties, UserHeader } from '.';
import { SettingsMenu } from '../../../settings-menu';
import { IconButton } from '@zero-tech/zui/components';

import { bem } from '../../../../lib/bem';

const c = bem('.user-header');

const featureFlags = { allowVerifyId: false };
jest.mock('../../../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe(UserHeader, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      userName: '',
      userHandle: '',
      userAvatarUrl: '',
      userIsOnline: true,
      includeUserSettings: false,

      onLogout: () => null,
      startConversation: () => null,
      ...props,
    };

    return shallow(<UserHeader {...allProps} />);
  };

  it('renders SettingsMenu when includeUserSettings is true', function () {
    const wrapper = subject({ includeUserSettings: true });
    expect(wrapper).toHaveElement(SettingsMenu);
  });

  it('does not render SettingsMenu when includeUserSettings is false', function () {
    const wrapper = subject({ includeUserSettings: false });
    expect(wrapper).not.toHaveElement(SettingsMenu);
  });

  it('renders userHandle when user handle is not empty', function () {
    const wrapper = subject({ userHandle: '0://zid.example' });
    expect(wrapper).toHaveElement(c('handle'));
  });

  it('does not render userHandle when user handle is empty', function () {
    const wrapper = subject({ userHandle: '' });
    expect(wrapper).not.toHaveElement(c('handle'));
  });

  it('renders IconButton', function () {
    const wrapper = subject();
    expect(wrapper).toHaveElement(IconButton);
  });

  it('calls startConversation when IconButton is clicked', function () {
    const startConversationMock = jest.fn();
    const wrapper = subject({ startConversation: startConversationMock });

    wrapper.find(IconButton).simulate('click');
    expect(startConversationMock).toHaveBeenCalled();
  });

  it('renders navigation link when user handle is a wallet address', function () {
    featureFlags.allowVerifyId = true;

    const wrapper = subject({ userHandle: '0x1234567890abcdef' });
    expect(wrapper).toHaveElement(c('link'));
  });

  it('does not render navigation link when user handle is not a wallet address', function () {
    featureFlags.allowVerifyId = true;

    const wrapper = subject({ userHandle: 'user123' });
    expect(wrapper).not.toHaveElement(c('link'));
  });
});
