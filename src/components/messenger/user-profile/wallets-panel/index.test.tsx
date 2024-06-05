import { shallow } from 'enzyme';

import { Properties, WalletsPanel } from '.';
import { PanelHeader } from '../../list/panel-header';

describe(WalletsPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      onBack: () => {},

      ...props,
    };

    return shallow(<WalletsPanel {...allProps} />);
  };

  it('publishes onBack event', () => {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(PanelHeader).simulate('back');

    expect(onBack).toHaveBeenCalled();
  });
});
