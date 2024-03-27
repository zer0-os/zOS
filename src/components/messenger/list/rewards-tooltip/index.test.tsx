import { shallow } from 'enzyme';

import { RewardsTooltip, Properties } from '.';
import { TooltipPopup } from '../../../tooltip-popup/tooltip-popup';

describe(RewardsTooltip, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      open: true,
      meowPreviousDayInUSD: '$3.14',
      onClose: () => {},
      ...props,
    };

    return shallow(<RewardsTooltip {...allProps} />);
  };

  it('renders the content', function () {
    const wrapper = subject({ meowPreviousDayInUSD: '$3.14' });

    expect(wrapper.find(TooltipPopup).prop('content')).toEqual('You earned $3.14');
  });

  it('calls props.onclose after 3 seconds', function () {
    const onClose = jest.fn();

    jest.useFakeTimers();
    subject({ meowPreviousDayInUSD: '$3.14', onClose });

    // still open after 1s
    jest.advanceTimersByTime(1000);
    expect(onClose).not.toHaveBeenCalled();

    // closed after 1s + 2s
    jest.advanceTimersByTime(2000);
    expect(onClose).toHaveBeenCalled();
  });
});
