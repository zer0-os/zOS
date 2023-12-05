import { shallow } from 'enzyme';

import { EditConversationPanel, Properties } from '.';

describe(EditConversationPanel, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onBack: () => null,
      ...props,
    };

    return shallow(<EditConversationPanel {...allProps} />);
  };

  it('TODO renders', function () {
    const wrapper = subject({});

    expect(wrapper.exists()).toBeTrue();
  });
});
