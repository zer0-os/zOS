import { shallow } from 'enzyme';

import { RewardsModal, Properties } from '.';

describe(RewardsModal, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      ...props,
    };

    return shallow(<RewardsModal {...allProps} />);
  };

  it('TODO renders', function () {
    const wrapper = subject({});

    expect(wrapper.exists()).toBeTrue();
  });
});
