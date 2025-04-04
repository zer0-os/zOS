import { shallow } from 'enzyme';
import { ProgressTracker } from '.';
import { RestoreProgress } from '../../../../store/matrix';

describe('ProgressTracker', () => {
  const subject = (props: RestoreProgress) => {
    return shallow(<ProgressTracker progress={props} />);
  };

  it('does not render when stage is empty', () => {
    const wrapper = subject({
      stage: '',
      total: 0,
      successes: 0,
      failures: 0,
    });

    expect(wrapper).toBeEmptyRender();
  });

  it('renders starting message when stage is start', () => {
    const wrapper = subject({
      stage: 'start',
      total: 0,
      successes: 0,
      failures: 0,
    });

    expect(wrapper).toHaveText('Starting secure backup restoration...');
  });

  it('renders fetching message when stage is fetch', () => {
    const wrapper = subject({
      stage: 'fetch',
      total: 0,
      successes: 0,
      failures: 0,
    });

    expect(wrapper).toHaveText('Fetching room keys...');
  });

  it('renders loading message with percentage when stage is load_keys and not complete', () => {
    const wrapper = subject({
      stage: 'load_keys',
      total: 4,
      successes: 1,
      failures: 0,
    });

    expect(wrapper).toHaveText('Restoring your encrypted messages... (25%)');
  });

  it('renders success message when stage is load_keys and complete', () => {
    const wrapper = subject({
      stage: 'load_keys',
      total: 2,
      successes: 2,
      failures: 0,
    });

    expect(wrapper).toHaveText('Keys loaded successfully');
  });
});
