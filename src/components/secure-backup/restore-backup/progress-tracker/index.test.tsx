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

    expect(wrapper).toHaveText('Preparing to restore your encrypted messages...');
  });

  it('renders fetching message when stage is fetch', () => {
    const wrapper = subject({
      stage: 'fetch',
      total: 0,
      successes: 0,
      failures: 0,
    });

    expect(wrapper).toHaveText('Retrieving your secure backup...(Please wait a few moments)');
  });

  it('renders initial loading message when progress is 1%', () => {
    const wrapper = subject({
      stage: 'load_keys',
      total: 100,
      successes: 1,
      failures: 0,
    });

    expect(wrapper).toHaveText('Starting to restore your encrypted messages...(1%)');
  });

  it('renders loading message when progress is 25%', () => {
    const wrapper = subject({
      stage: 'load_keys',
      total: 100,
      successes: 25,
      failures: 0,
    });

    expect(wrapper).toHaveText('Loading your encrypted conversations...(25%)');
  });

  it('renders loading message when progress is 50%', () => {
    const wrapper = subject({
      stage: 'load_keys',
      total: 100,
      successes: 50,
      failures: 0,
    });

    expect(wrapper).toHaveText('Almost there! Restoring your final messages...(50%)');
  });

  it('renders loading message when progress is 75%', () => {
    const wrapper = subject({
      stage: 'load_keys',
      total: 100,
      successes: 75,
      failures: 0,
    });

    expect(wrapper).toHaveText('Finishing up! Just a few more messages to restore...(75%)');
  });

  it('renders failure message when there are failures', () => {
    const wrapper = subject({
      stage: 'load_keys',
      total: 10,
      successes: 8,
      failures: 2,
    });

    expect(wrapper).toIncludeText('2 keys could not be restored. Some messages may remain encrypted.');
  });

  it('renders success message when stage is load_keys and complete', () => {
    const wrapper = subject({
      stage: 'load_keys',
      total: 2,
      successes: 2,
      failures: 0,
    });

    expect(wrapper).toIncludeText('Your encrypted messages have been successfully restored!(100%)');
  });
});
