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

  it('renders accordian with all items', function () {
    const wrapper = subject();

    const accordion: any = wrapper.find('Accordion');
    const items = accordion.props().items;

    expect(items).toHaveLength(5);
  });

  it('publishes onBack event', function () {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    const button = wrapper.find(c('back'));
    button.simulate('click');

    expect(onBack).toHaveBeenCalledOnce();
  });
});
