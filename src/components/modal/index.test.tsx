import { shallow } from 'enzyme';

import { Modal, Properties } from '.';
import { bem } from '../../lib/bem';

const c = bem('.modal');

describe(Modal, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      title: 'stub title',
      onClose: () => null,
      ...props,
    };

    return shallow(<Modal {...allProps} />);
  };

  it('renders the title', function () {
    const wrapper = subject({ title: 'My Modal' });

    expect(wrapper.find(c('title'))).toHaveText('My Modal');
  });

  it('publishes close event when X clicked', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('IconButton').simulate('click');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes close event modal announces an open change', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('Modal').simulate('openChange', false);

    expect(onClose).toHaveBeenCalled();
  });
});
