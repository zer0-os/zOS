import { shallow } from 'enzyme';

import { Container, Properties } from './container';
import { InviteCodeStatus } from '../../store/registration';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      inviteCodeStatus: '',
      resetInviteStatus: () => null,
      validateInvite: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', function () {
    const wrapper = subject({ isLoading: true, inviteCodeStatus: InviteCodeStatus.VALID });
    expect(wrapper.find('Invite').props()).toEqual(
      expect.objectContaining({
        isLoading: true,
        inviteCodeStatus: InviteCodeStatus.VALID,
      })
    );
  });
});
