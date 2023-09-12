import { shallow } from 'enzyme';

import { AndroidDownload, Properties } from '.';

describe(AndroidDownload, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      storePath: '',
      onUseBrowser: () => null,
      ...props,
    };

    return shallow(<AndroidDownload {...allProps} />);
  };

  it('renders link to play store', function () {
    const wrapper = subject({ storePath: 'some.url.example.com' });

    expect(wrapper.find('a').prop('href')).toEqual('some.url.example.com');
  });

  it('publishes onUseBrowser when button clicked', function () {
    const onUseBrowser = jest.fn();
    const wrapper = subject({ onUseBrowser });

    wrapper.find('Button').simulate('press');

    expect(onUseBrowser).toHaveBeenCalled();
  });
});
