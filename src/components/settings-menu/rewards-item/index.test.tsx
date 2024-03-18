import { shallow } from 'enzyme';

import { RewardsItem, Properties } from '.';
import { bem } from '../../../lib/bem';

const c = bem('.rewards-item');

describe(RewardsItem, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      totalUSD: '$0',
      totalMeow: '0.222',
      ...props,
    };

    return shallow(<RewardsItem {...allProps} />);
  };

  it('renders the values', function () {
    const wrapper = subject({ totalUSD: '$1.00 USD', totalMeow: '0.1 MEOW' });

    expect(wrapper.find(c('usd'))).toHaveText('$1.00 USD');
    expect(wrapper.find(c('meow'))).toHaveText('0.1 MEOW');
  });
});
