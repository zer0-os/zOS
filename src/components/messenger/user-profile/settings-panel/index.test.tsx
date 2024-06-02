import { shallow } from 'enzyme';

import { SettingsPanel, Properties } from '.';
import { PanelHeader } from '../../list/panel-header';

describe(SettingsPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      onBack: () => {},

      ...props,
    };

    return shallow(<SettingsPanel {...allProps} />);
  };

  it('publishes onBack event', () => {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(PanelHeader).simulate('back');

    expect(onBack).toHaveBeenCalled();
  });
});
