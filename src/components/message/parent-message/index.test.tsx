import { shallow } from 'enzyme';

import { ParentMessage, Properties } from '.';

describe(ParentMessage, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      message: 'stub message',
      senderIsCurrentUser: false,
      senderFirstName: 'StubFirst',
      senderLastName: 'StubLast',
      ...props,
    };

    return shallow(<ParentMessage {...allProps} />);
  };

  it('renders the sender name', function () {
    const wrapper = subject({
      senderIsCurrentUser: false,
      senderFirstName: 'Jackie',
      senderLastName: 'Chan',
    });

    expect(wrapper.find('.parent-message__header').text()).toEqual('Jackie Chan');
  });

  it('renders "You" if the sender is the current user', function () {
    const wrapper = subject({
      senderIsCurrentUser: true,
      senderFirstName: 'Jackie',
      senderLastName: 'Chan',
    });

    expect(wrapper.find('.parent-message__header').text()).toEqual('You');
  });
});
