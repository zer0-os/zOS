import { shallow } from 'enzyme';

import { Success, Properties } from '.';

describe(Success, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      successMessage: '',
      ...props,
    };

    return shallow(<Success {...allProps} />);
  };

  it('renders the message', function () {
    const wrapper = subject({ successMessage: 'congrats!' });

    expect(wrapper).toHaveText('congrats!');
  });
});
