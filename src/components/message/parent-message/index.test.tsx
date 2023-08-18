import { shallow } from 'enzyme';

import { ParentMessage, Properties } from '.';

describe('ParentMessage', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      ...props,
    };

    return shallow(<ParentMessage {...allProps} />);
  };

  it('TODO renders', function () {
    const wrapper = subject({});

    expect(wrapper.exists()).toBeTrue();
  });
});
