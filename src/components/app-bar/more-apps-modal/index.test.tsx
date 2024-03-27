import { shallow } from 'enzyme';

import { MoreAppsModal, Properties } from '.';

describe(MoreAppsModal, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      ...props,
    };

    return shallow(<MoreAppsModal {...allProps} />);
  };

  it('TODO renders', function () {
    const wrapper = subject({});

    expect(wrapper.exists()).toBeTrue();
  });
});
