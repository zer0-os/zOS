import { shallow } from 'enzyme';

import { RewardsPopup, Properties } from '.';

describe('RewardsPopup', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      usd: '',
      zero: '',
      ...props,
    };

    return shallow(<RewardsPopup {...allProps} />);
  };

  it('renders your rewards count in USD', function () {
    const wrapper = subject({ usd: '$5.71' });

    expect(wrapper.find('.rewards-popup__rewards-usd').text()).toEqual('$5.71');
  });

  it('renders your rewards count in ZERO', function () {
    const wrapper = subject({ zero: '838' });

    expect(wrapper.find('.rewards-popup__rewards-zero').text()).toEqual('838 ZERO');
  });
});
