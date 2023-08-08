import { shallow } from 'enzyme';

import { AdminMessage, Properties } from '.';

describe('AdminMessage', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      message: '',
      ...props,
    };

    return shallow(<AdminMessage {...allProps} />);
  };

  it('renders the message', function () {
    const wrapper = subject({ message: 'test message' });

    expect(wrapper.find('.admin-message').text().trim()).toEqual('test message');
  });
});
