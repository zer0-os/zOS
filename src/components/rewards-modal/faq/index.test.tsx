import { shallow } from 'enzyme';

import { Faq, Properties } from '.';
import { bem } from '../../../lib/bem';

const c = bem('.rewards-modal-faq');

describe(Faq, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onBack: () => null,
      ...props,
    };

    return shallow(<Faq {...allProps} />);
  };

  it('publishes onBack event', function () {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(c('back')).simulate('click');

    expect(onBack).toHaveBeenCalledOnce();
  });
});
