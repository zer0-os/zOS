import { shallow } from 'enzyme';

import { Properties, AccountManagementPanel } from '.';
import { PanelHeader } from '../../list/panel-header';
import { bem } from '../../../../lib/bem';
import { Button } from '@zero-tech/zui/components/Button';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const featureFlags = { enableAddWallets: true };
jest.mock('../../../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

// Mock the ConnectButton from rainbowkit
jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: {
    Custom: ({ children }) => children({ account: { address: '0x123' }, openConnectModal: jest.fn() }),
  },
}));

const c = bem('.account-management-panel');

describe(AccountManagementPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      error: '',
      successMessage: '',
      isAddEmailModalOpen: false,
      currentUser: {},
      canAddEmail: false,
      isWalletConnected: false,
      connectedWallet: '',

      onBack: () => {},
      onOpenAddEmailModal: () => {},
      onCloseAddEmailModal: () => {},
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

  it('renders error alert if error is present', () => {
    const wrapper = subject({ error: 'An error occurred' });

    expect(wrapper.find('Alert[variant="error"]').exists()).toEqual(true);
    expect(wrapper.find('Alert[variant="error"]').prop('isFilled')).toEqual(true);

    const props = wrapper.find(c('alert-text'));
    expect(props.text()).toEqual('An error occurred');
  });

  it('renders success alert if successMessage is present', () => {
    const wrapper = subject({ successMessage: 'Email added successfully' });

    expect(wrapper.find('Alert[variant="success"]').exists()).toEqual(true);
    expect(wrapper.find('Alert[variant="success"]').prop('isFilled')).toEqual(true);

    const props = wrapper.find(c('alert-text'));
    expect(props.text()).toEqual('Email added successfully');
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

  describe('add email modal', () => {
    it('renders add email modal if isAddEmailModalOpen is true', () => {
      const wrapper = subject({ isAddEmailModalOpen: true });

      expect(wrapper.find('Modal').prop('open')).toEqual(true);
      expect(wrapper.find(c('add-email-title')).text()).toEqual('Add Email');
    });

    it('does not render add email modal if isAddEmailModalOpen is false', () => {
      const wrapper = subject({ isAddEmailModalOpen: false });

      expect(wrapper.find('Modal').prop('open')).toEqual(false);
    });

    it('publishes onOpenAddEmailModal when add email is clicked', () => {
      const onOpenAddEmailModal = jest.fn();
      const wrapper = subject({ onOpenAddEmailModal, currentUser: { primaryEmail: null }, canAddEmail: true });

      wrapper.find(Button).simulate('press');

      expect(onOpenAddEmailModal).toHaveBeenCalled();
    });

    it('publishes onCloseAddEmailModal event when modal is closed via onOpenChange', () => {
      const onCloseAddEmailModal = jest.fn();
      const wrapper = subject({ onCloseAddEmailModal, isAddEmailModalOpen: true });

      wrapper.find('Modal').simulate('openChange', false);

      expect(onCloseAddEmailModal).toHaveBeenCalled();
    });

    it('publishes onCloseAddEmailModal event when modal is closed via Close IconButton click', () => {
      const onCloseAddEmailModal = jest.fn();
      const wrapper = subject({ onCloseAddEmailModal, isAddEmailModalOpen: true });

      wrapper.find('IconButton').simulate('click');

      expect(onCloseAddEmailModal).toHaveBeenCalled();
    });
  });

  describe('link new wallet', () => {
    it('should render Add Wallet button if user has no wallet linked to his ZERO account', () => {
      const wrapper = subject({ currentUser: { primaryEmail: 'ratik@zero.tech', wallets: [] } });

      expect(wrapper.find(ConnectButton.Custom).exists()).toEqual(true);
    });

    it('should not render Add Wallet button if user has a wallet linked to his ZERO account', () => {
      const wrapper = subject({ currentUser: { primaryEmail: 'test@zero.tech', wallets: [{ id: 'wallet-id-1' }] } });
      expect(wrapper.find(ConnectButton.Custom).exists()).toEqual(false);
    });

    it('should open Link Wallet modal when user clicks on Add Wallet, and metamask is connected', () => {
      const wrapper = subject({
        currentUser: { primaryEmail: 'ratik@zero.tech', wallets: [] },
        isWalletConnected: true,
        connectedWallet: '0xA100C16E67884Da7d515211Bb065592079bEcde6',
      });

      wrapper.setState({ isUserLinkingNewWallet: true });

      const linkWalletModal = wrapper.find('Modal').at(1);
      expect(linkWalletModal.exists()).toEqual(true);
      expect(linkWalletModal.prop('title')).toEqual('Link Wallet');
      expect(linkWalletModal.find(c('link-new-wallet-modal')).text()).toEqual(
        'You have a wallet connected by the address 0xA100C16E67884Da7d515211Bb065592079bEcde6Do you want to link this wallet with your ZERO account?'
      );
    });

    it('should update isUserLinkingNewWallet state to false when user closes Link Wallet modal', () => {
      const wrapper = subject({
        currentUser: { primaryEmail: 'ratik@zero.tech', wallets: [] },
        isWalletConnected: true,
      });

      wrapper.setState({ isUserLinkingNewWallet: true });

      const linkWalletModal = wrapper.find('Modal').at(1);
      (linkWalletModal as any).props().onClose();
      expect(wrapper.state('isUserLinkingNewWallet')).toEqual(false);
    });
  });
});
