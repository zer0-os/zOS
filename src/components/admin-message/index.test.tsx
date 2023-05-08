import { shallow } from 'enzyme';

import { AdminMessage, Properties } from '.';

describe('AdminMessage', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      message: '',
      createdAt: 0,
      ...props,
    };

    return shallow(<AdminMessage {...allProps} />);
  };

  it('renders the date', function () {
    const wrapper = subject({ message: 'test message', createdAt: 1681745762146 });

    expect(wrapper.find('.admin-message__date').text().trim()).toEqual('17/04/2023');
  });
});
