import { shallow } from 'enzyme';

import { RewardsModal, Properties } from '.';

import { bem } from '../../lib/bem';
import { Faq } from './faq';
const c = bem('.rewards-modal');

describe(RewardsModal, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      totalUSD: '0',
      totalMeow: '0',
      onClose: () => null,
      ...props,
    };

    return shallow(<RewardsModal {...allProps} />);
  };

  it('renders the values', function () {
    const wrapper = subject({ totalUSD: '$1.00 USD', totalMeow: '0.1 MEOW' });

    expect(wrapper.find(c('usd'))).toHaveText('$1.00 USD');
    expect(wrapper.find(c('meow'))).toHaveText('0.1 MEOW');
  });

  it('publishes close event modal announces an open change', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('Modal').simulate('openChange', false);

    expect(onClose).toHaveBeenCalled();
  });

  it('toggles the FAQ', function () {
    const wrapper = subject({});

    expect(wrapper.find(c('slide-container'))).not.toHaveClassName(c('slide-container--faq'));

    wrapper.find(c('learn-more')).simulate('click');
    expect(wrapper.find(c('slide-container'))).toHaveClassName(c('slide-container--faq'));

    wrapper.find(Faq).simulate('back');
    expect(wrapper.find(c('slide-container'))).not.toHaveClassName(c('slide-container--faq'));
  });
});
