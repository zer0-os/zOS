import { shallow } from 'enzyme';

import { Faq, Properties } from '.';

describe(Faq, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onBack: () => null,
      ...props,
    };

    return shallow(<Faq {...allProps} />);
  };

  it('TODO renders', function () {
    const wrapper = subject({});

    expect(wrapper.exists()).toBeTrue();
  });
});
