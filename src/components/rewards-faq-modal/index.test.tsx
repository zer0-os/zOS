import { shallow } from 'enzyme';

import { RewardsFAQModal, Properties } from '.';
import { rewardsFaq } from './constants';

describe('RewardsPopup', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isRewardsFAQModalOpen: false,

      closeRewardsFAQModal: () => null,
      ...props,
    };

    return shallow(<RewardsFAQModal {...allProps} />);
  };

  it('opens the rewards faq modal', function () {
    const wrapper = subject({ isRewardsFAQModalOpen: true });

    const accordian = wrapper.find('.rewards-faq-modal Accordion');
    expect(accordian.exists()).toEqual(true);
    expect(accordian.prop('items')).toEqual(rewardsFaq);
  });

  it('closes the rewards faq modal', function () {
    const closeRewardsFAQModal = jest.fn();
    const wrapper = subject({ isRewardsFAQModalOpen: true, closeRewardsFAQModal });

    wrapper.find('.rewards-faq-modal__close').simulate('click');
    expect(closeRewardsFAQModal).toHaveBeenCalledOnce();
  });
});
