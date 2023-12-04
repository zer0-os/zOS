import { shallow } from 'enzyme';

import { GroupManagement, Properties } from '.';

describe('GroupManagement', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      ...props,
    };

    return shallow(<GroupManagement {...allProps} />);
  };

  it('TODO renders', function () {
    const wrapper = subject({});

    expect(wrapper.exists()).toBeTrue();
  });
});
