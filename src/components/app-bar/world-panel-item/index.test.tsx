import { shallow } from 'enzyme';

import { WorldPanelItem, Properties } from '.';
import { IconActivityHeart, IconCheck } from '@zero-tech/zui/icons';

describe(WorldPanelItem, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      Icon: IconCheck,
      isActive: false,
      label: 'stub',
      ...props,
    };

    return shallow(<WorldPanelItem {...allProps} />);
  };

  it('renders the icon provided', function () {
    const wrapper = subject({ Icon: IconActivityHeart });

    expect(wrapper).toHaveElement(IconActivityHeart);
  });

  it('styles active state', function () {
    expect(subject({ isActive: false })).not.toHaveClassName('world-panel-item--active');
    expect(subject({ isActive: true })).toHaveClassName('world-panel-item--active');
  });

  it('shows a label on hover (default HTML title)', function () {
    const wrapper = subject({ label: 'my app' });

    expect(wrapper.find('.world-panel-item__icon')).toHaveProp('title', 'my app');
  });
});
