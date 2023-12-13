import { shallow } from 'enzyme';
import { Properties, UserHeader } from '.';
import { SettingsMenu } from '../../../settings-menu';
import { IconButton } from '@zero-tech/zui/components';

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

  it('renders users name ', function () {
    const wrapper = subject({ userName: 'Joe Bloggs' });

    expect(wrapper.find('.user-header__user-name').text()).toEqual('Joe Bloggs');
  });

  it('renders IconButton', function () {
    const wrapper = subject();
    expect(wrapper.find(IconButton).exists()).toBe(true);
  });

  it('calls startConversation when IconButton is clicked', function () {
    const startConversationMock = jest.fn();
    const wrapper = subject({ startConversation: startConversationMock });

    wrapper.find(IconButton).simulate('click');
    expect(startConversationMock).toHaveBeenCalled();
  });
});
