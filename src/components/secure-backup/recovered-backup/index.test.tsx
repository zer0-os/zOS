import { shallow } from 'enzyme';

import { RecoveredBackup, Properties } from '.';

import { bem } from '../../../lib/bem';
const c = bem('.secure-backup');

describe(RecoveredBackup, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      onLearnMore: () => null,
      ...props,
    };

    return shallow(<RecoveredBackup {...allProps} />);
  };

  it('publishes onLearnMore event', function () {
    const onLearnMore = jest.fn();
    const wrapper = subject({ onLearnMore });

    wrapper.find(c('learn-more')).simulate('click');

    expect(onLearnMore).toHaveBeenCalledOnce();
  });
});
