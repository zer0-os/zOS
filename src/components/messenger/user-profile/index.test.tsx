import { shallow } from 'enzyme';

import { UserProfile, Properties } from '.';
import { PanelHeader } from '../list/panel-header';

import { Image } from '@zero-tech/zui/components';
import { IconCurrencyEthereum } from '@zero-tech/zui/icons';

import { bem } from '../../../lib/bem';

const c = bem('.user-profile');

describe(UserProfile, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      name: '',
      image: '',
      subHandle: '',

      onBack: () => null,
      ...props,
    };

    return shallow(<UserProfile {...allProps} />);
  };

  it('publishes onBack event', () => {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(PanelHeader).simulate('back');

    expect(onBack).toHaveBeenCalled();
  });

  it('renders subhandle when subhandle prop is provided', () => {
    const wrapper = subject({ subHandle: '0://subhandle' });
    expect(wrapper.find(c('sub-handle'))).toHaveText('0://subhandle');
  });

  it('renders custom image when image prop is provided', () => {
    const wrapper = subject({ image: 'image-url' });
    expect(wrapper.find(Image)).toHaveProp('src', 'image-url');
    expect(wrapper).not.toHaveElement(IconCurrencyEthereum);
  });

  it('renders default image when image prop is not provided', () => {
    const wrapper = subject({ image: '' });
    expect(wrapper).toHaveElement(IconCurrencyEthereum);
  });
});
