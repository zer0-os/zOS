import { shallow } from 'enzyme';

import { AppBar, Properties } from '.';

describe(AppBar, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      ...props,
    };

    return shallow(<AppBar {...allProps} />);
  };

  it('TODO renders', function () {
    const wrapper = subject({});

    expect(wrapper.exists()).toBeTrue();
  });
});
