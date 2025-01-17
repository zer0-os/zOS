import { shallow } from 'enzyme';

import { LinkedAccountsPanel, Properties } from '.';
import { PanelHeader } from '../../list/panel-header';

describe(LinkedAccountsPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      onBack: () => {},
      onTelegramLink: () => {},

      ...props,
    };

    return shallow(<LinkedAccountsPanel {...allProps} />);
  };

  it('publishes onBack event', () => {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(PanelHeader).simulate('back');

    expect(onBack).toHaveBeenCalled();
  });

  it('publishes onTelegramLink event', () => {
    const onTelegramLink = jest.fn();
    const wrapper = subject({ onTelegramLink });

    wrapper.find(PanelHeader).simulate('back');

    expect(onTelegramLink).toHaveBeenCalled();
  });
});
