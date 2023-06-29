import { shallow } from 'enzyme';

import { RewardsPopup, Properties } from '.';

describe('RewardsPopup', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      usd: '1',
      zero: '1',
      isLoading: false,
      isFullScreen: false,
      withTitleBar: true,
      onClose: () => null,
      openRewardsFAQModal: () => null,
      ...props,
    };

    return shallow(<RewardsPopup {...allProps} />);
  };

  /* @note 29-06-2023
   * Removed this test as component isn't rigged up to render USD price
   */
  // it('renders your rewards count in USD', function () {
  //   const wrapper = subject({ usd: '$5.71' });
  //
  //   const skeleton = wrapper.find('.rewards-popup__rewards-usd SkeletonText');
  //   expect((skeleton.prop('asyncText') as any).text).toEqual('$5.71');
  // });

  it('renders your rewards count in ZERO', function () {
    const wrapper = subject({ zero: '838' });

    expect(wrapper.find('.rewards-popup__rewards-zero').text()).toEqual('838 $ZERO');
  });

  it('sets the skeleton loading attribute', function () {
    const wrapper = subject({ isLoading: true });

    let skeleton = wrapper.find('.rewards-popup__rewards-usd SkeletonText');
    expect((skeleton.prop('asyncText') as any).isLoading).toEqual(true);

    wrapper.setProps({ isLoading: false });
    skeleton = wrapper.find('.rewards-popup__rewards-usd SkeletonText');
    expect((skeleton.prop('asyncText') as any).isLoading).toEqual(false);
  });

  it('publishes onClose', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('.rewards-popup__underlay').simulate('click');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('prevent closing the rewards modal if you click "inside" it', function () {
    const verifyCalled = jest.fn();
    const wrapper = subject({});

    wrapper.find('.rewards-popup__content').simulate('click', {
      stopPropagation: () => {
        verifyCalled();
      },
    });

    // asserts that the stopPropagation function was called
    expect(verifyCalled).toHaveBeenCalledOnce();
  });

  it('opens rewards faq modal if you click on the learn more', function () {
    const openRewardsFAQModal = jest.fn();
    const wrapper = subject({ openRewardsFAQModal });

    wrapper.find('.rewards-popup__rewards-faq-text').simulate('click');

    // asserts that the stopPropagation function was called
    expect(openRewardsFAQModal).toHaveBeenCalledOnce();
  });
});
