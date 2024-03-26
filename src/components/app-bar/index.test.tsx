import { shallow } from 'enzyme';

import { AppBar, Properties } from '.';
import { WorldPanelItem } from './world-panel-item';
import { IconMessageSquare2 } from '@zero-tech/zui/icons';

describe(AppBar, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      ...props,
    };

    return shallow(<AppBar {...allProps} />);
  };

  it('renders the Messenger item', function () {
    const wrapper = subject({});

    expect(wrapper.find(WorldPanelItem).at(0)).toHaveProp('Icon', IconMessageSquare2);
  });
});
