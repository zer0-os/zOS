import { shallow } from 'enzyme';

import { Properties, WalletsPanel } from '.';
import { PanelHeader } from '../../list/panel-header';

describe(WalletsPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      error: '',
      isModalOpen: false,

      onBack: () => {},
      onSelect: () => {},
      onOpenModal: () => {},
      onCloseModal: () => {},
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

  it('renders wallet select modal if isModalOpen is true', () => {
    const wrapper = subject({ isModalOpen: true });

    expect(wrapper.find('Modal').prop('open')).toEqual(true);
  });

  it('does not render wallet select modal if isModalOpen is false', () => {
    const wrapper = subject({ isModalOpen: false });

    expect(wrapper.find('Modal').prop('open')).toEqual(false);
  });

  it('publishes onOpenModal event when modal is opened', () => {
    const onOpenModal = jest.fn();
    const wrapper = subject({ onOpenModal, isModalOpen: false });

    wrapper.find('Modal').simulate('openChange', true);

    expect(onOpenModal).toHaveBeenCalled();
  });

  it('publishes onCloseModal event when modal is closed', () => {
    const onCloseModal = jest.fn();
    const wrapper = subject({ onCloseModal, isModalOpen: true });

    wrapper.find('Modal').simulate('openChange', false);

    expect(onCloseModal).toHaveBeenCalled();
  });

  it('publishes onSelect event when wallet is selected', () => {
    const onSelect = jest.fn();
    const wrapper = subject({ onSelect });

    wrapper.find('WalletSelect').simulate('select', 'MetaMask');
    expect(onSelect).toHaveBeenCalledWith('MetaMask');
  });

  it('renders error alert if error is present', () => {
    const wrapper = subject({ error: 'An error occurred' });

    expect(wrapper.find('Alert').prop('variant')).toEqual('error');
    expect(wrapper.find('Alert').prop('isFilled')).toEqual(true);

    const props = wrapper.find('Alert').prop('children');
    expect(props).toEqual(<div className='wallets-panel__alert-text'>An error occurred</div>);
  });
});
