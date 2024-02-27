import { shallow } from 'enzyme';

import { Success, Properties } from '.';

import { Button } from '@zero-tech/zui/components';

describe(Success, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      successMessage: '',
      onClose: () => null,
      ...props,
    };

    return shallow(<Success {...allProps} />);
  };

  it('publishes onClose event', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(Button).simulate('press');

    expect(onClose).toHaveBeenCalledOnce();
  });
});
