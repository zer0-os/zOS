import { StoreBuilder } from '../../../../store/test/store';
import { Container } from './container';
import { shallow } from 'enzyme';

describe(Container, () => {
  const subject = (props: any = {}) => {
    const allProps = {
      meowPreviousDayInUSD: '',
      isLoading: false,
      rewardsTooltipClosed: () => {},
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('should render null if loading', () => {
    const wrapper = subject({ isLoading: true });
    expect(wrapper).toBeEmptyRender();
  });

  it('should render null if meowPreviousDayInUSD is $0.00', () => {
    const wrapper = subject({ isLoading: false, meowPreviousDayInUSD: '$0.00' });
    expect(wrapper).toBeEmptyRender();
  });

  describe('mapState', () => {
    test('meowPreviousDayInUSD', () => {
      const state = new StoreBuilder().withOtherState({
        rewards: {
          meowPreviousDay: '9123456789111315168',
          meowInUSD: 0.45,
        },
      });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ meowPreviousDayInUSD: '$4.11' }));
    });

    test('isLoading', () => {
      const state = new StoreBuilder().withOtherState({
        rewards: {
          meowPreviousDay: '0',
          loading: true,
        },
      });

      expect(Container.mapState(state.build())).toEqual(expect.objectContaining({ isLoading: true }));
    });
  });
});
