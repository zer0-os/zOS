import { shallow } from 'enzyme';

import { ConversationHeader, Properties } from '.';

// Tests to be added in follow up
describe(ConversationHeader, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      ...props,
    } as any;

    return shallow(<ConversationHeader {...allProps} />);
  };

  it('TODO renders', function () {
    const wrapper = subject({});

    expect(wrapper.exists()).toBeTrue();
  });
});
