import { shallow } from 'enzyme';

import { ParentMessage, Properties } from '.';

describe(ParentMessage, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      message: 'stub message',
      senderFirstName: 'StubFirst',
      senderLastName: 'StubLast',
      ...props,
    };

    return shallow(<ParentMessage {...allProps} />);
  };

  it('renders the sender name', function () {
    const wrapper = subject({
      senderFirstName: 'Jackie',
      senderLastName: 'Chan',
    });

    expect(wrapper.find('.parent-message__header').text()).toEqual('Jackie Chan');
  });
});
