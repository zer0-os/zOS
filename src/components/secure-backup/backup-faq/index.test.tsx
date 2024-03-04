import { shallow } from 'enzyme';

import { BackupFAQ, Properties } from '.';

import { bem } from '../../../lib/bem';
const c = bem('.secure-backup');

describe(BackupFAQ, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      onBack: () => null,
      ...props,
    };

    return shallow(<BackupFAQ {...allProps} />);
  };

  it('publishes onBack event', function () {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(c('back')).simulate('click');

    expect(onBack).toHaveBeenCalledOnce();
  });
});
