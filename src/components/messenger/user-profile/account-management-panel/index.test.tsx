import { shallow } from 'enzyme';

import { Properties, AccountManagementPanel } from '.';
import { PanelHeader } from '../../list/panel-header';
import { bem } from '../../../../lib/bem';
import { Button } from '@zero-tech/zui/components/Button';

const c = bem('.account-management-panel');

describe(AccountManagementPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      error: '',
      isModalOpen: false,
      currentUser: {},
      canAddEmail: false,

      onBack: () => {},
      onSelect: () => {},
      onOpenModal: () => {},
      onCloseModal: () => {},
      ...props,
    };

    return shallow(<AccountManagementPanel {...allProps} />);
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

    expect(wrapper.find('Alert[variant="error"]').exists()).toEqual(true);
    expect(wrapper.find('Alert[variant="error"]').prop('isFilled')).toEqual(true);

    const props = wrapper.find('Alert[variant="error"]').prop('children');
    expect(props).toEqual(<div className='account-management-panel__alert-text'>An error occurred</div>);
  });

  describe('wallets section', () => {
    it('renders wallets header (no wallet)', () => {
      const wrapper = subject({ currentUser: { wallets: [], primaryEmail: 'test@zero.tech' } });

      expect(wrapper.find(c('wallets-header')).text()).toEqual('no wallets');
    });

    it('renders wallets header (1 wallet)', () => {
      const wrapper = subject({ currentUser: { wallets: [{ id: 'wallet-id-1' }] } });

      expect(wrapper.find(c('wallets-header')).text()).toEqual('1 wallet');
    });

    it('renders wallets header (multiple wallets)', () => {
      const wrapper = subject({ currentUser: { wallets: [{ id: 'wallet-id-1' }, { id: 'wallet-id-2' }] } });

      expect(wrapper.find(c('wallets-header')).text()).toEqual('2 wallets');
    });

    it('renders wallet list items', () => {
      const wrapper = subject({
        currentUser: {
          wallets: [
            { id: 'wallet-id-1', publicAddress: 'address-1' },
            { id: 'wallet-id-2', publicAddress: 'address-2' },
          ],
        },
      });

      expect(wrapper.find('WalletListItem')).toHaveLength(2);
      expect(wrapper.find('WalletListItem').at(0).prop('wallet')).toEqual({
        id: 'wallet-id-1',
        publicAddress: 'address-1',
      });
      expect(wrapper.find('WalletListItem').at(1).prop('wallet')).toEqual({
        id: 'wallet-id-2',
        publicAddress: 'address-2',
      });
    });

    it('renders no wallets found alert', () => {
      const wrapper = subject({ currentUser: { wallets: [], primaryEmail: 'test@zero.tech' } });

      expect(wrapper.find('Alert[variant="info"]').exists()).toEqual(true);
      expect(wrapper.find(c('alert-info-text')).text()).toEqual('No wallets found');
    });
  });

  describe('email section', () => {
    it('renders email header', () => {
      const wrapper = subject({ currentUser: { primaryEmail: 'test@zero.tech' } });

      expect(wrapper.find(c('email-header')).text()).toEqual('Email');
    });

    it('renders email item', () => {
      const wrapper = subject({ currentUser: { primaryEmail: 'test@zero.tech' } });

      expect(wrapper.find('CitizenListItem').prop('user')).toEqual({
        firstName: 'test@zero.tech',
        primaryEmail: 'test@zero.tech',
      });
    });

    it('renders no email found alert', () => {
      const wrapper = subject({
        currentUser: { primaryEmail: null, wallets: [{ id: 'wallet-id-1', publicAddress: 'address456' }] },
      });

      expect(wrapper.find('Alert[variant="info"]').exists()).toEqual(true);
      expect(wrapper.find(c('alert-info-text')).text()).toEqual('No email account found');
    });

    it('renders add email button if canAddEmail is true', () => {
      const wrapper = subject({ currentUser: { primaryEmail: null }, canAddEmail: true });

      expect(wrapper.find(Button).exists()).toEqual(true);
      expect(wrapper.find(Button).prop('children')).toEqual('Add email');
    });

    it('does not render add email button if canAddEmail is false', () => {
      const wrapper = subject({ currentUser: { primaryEmail: 'test@zero.tech' }, canAddEmail: false });

      expect(wrapper.find(Button).exists()).toEqual(false);
    });
  });
});
