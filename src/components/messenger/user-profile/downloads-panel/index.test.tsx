import { shallow } from 'enzyme';
import { DownloadsPanel, Properties } from '.';
import { PanelHeader } from '../../list/panel-header';

describe(DownloadsPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      onClose: () => {},
      ...props,
    };

    return shallow(<DownloadsPanel {...allProps} />);
  };

  it('publishes onClose event ', () => {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(PanelHeader).simulate('back');

    expect(onClose).toHaveBeenCalled();
  });
});
