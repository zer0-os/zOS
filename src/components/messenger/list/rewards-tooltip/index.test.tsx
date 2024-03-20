import { shallow } from 'enzyme';

import { RewardsTooltip, Properties } from '.';
import { TooltipPopup } from '../../../tooltip-popup/tooltip-popup';

describe(RewardsTooltip, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      meowPreviousDayInUSD: '$3.14',
      ...props,
    };

    return shallow(<RewardsTooltip {...allProps} />);
  };

  it('renders the content', function () {
    const wrapper = subject({ meowPreviousDayInUSD: '$3.14' });

    expect(wrapper.find(TooltipPopup).prop('content')).toEqual('You earned $3.14');
  });

  it('closes the tooltip after 3 seconds', function () {
    jest.useFakeTimers();
    const wrapper = subject({ meowPreviousDayInUSD: '$3.14' });

    expect(wrapper.find(TooltipPopup).prop('open')).toEqual(true);

    // still open after 1s
    jest.advanceTimersByTime(1000);
    expect(wrapper.find(TooltipPopup).prop('open')).toEqual(true);

    // closed after 1s + 2s
    jest.advanceTimersByTime(2000);
    expect(wrapper.find(TooltipPopup).prop('open')).toEqual(false);
  });
});
