import { shallow } from 'enzyme';

import { Properties, AccountManagementPanel } from '.';
import { PanelHeader } from '../../list/panel-header';
import { bem } from '../../../../lib/bem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { State } from '../../../../store/account-management';

// Mock the ConnectButton from rainbowkit
jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: {
    Custom: ({ children }) => children({ account: { address: '0x123' }, openConnectModal: jest.fn() }),
  },
  getDefaultConfig: jest.fn(),
}));

jest.mock('../../../../lib/web3/thirdweb/client', () => ({
  getThirdWebClient: jest.fn(),
  getChain: jest.fn(() => ({
    blockExplorers: [{ url: 'https://sepolia.etherscan.io' }],
  })),
}));

const c = bem('.account-management-panel');

describe(AccountManagementPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      error: '',
      successMessage: '',
      connectedWalletAddr: '',
      addWalletState: State.NONE,
      wallets: [],
      onBack: () => {},
      reset: () => {},
      onAddNewWallet: () => {},
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

  describe('self-custody wallets section', () => {
    it('renders wallets header (no wallet)', () => {
      const wrapper = subject({ wallets: [] });

      expect(wrapper.find(c('wallets-header')).first().text()).toEqual('no self-custody wallets');
    });

    it('renders wallets header (1 wallet)', () => {
      const wrapper = subject({ wallets: [{ id: 'wallet-id-1', publicAddress: '0x123', isThirdWeb: false }] });

      expect(wrapper.find(c('wallets-header')).first().text()).toEqual('1 self-custody wallet');
    });

    it('renders wallets header (multiple wallets)', () => {
      const wrapper = subject({
        wallets: [
          { id: 'wallet-id-1', publicAddress: '0x1', isThirdWeb: false },
          { id: 'wallet-id-2', publicAddress: '0x2', isThirdWeb: false },
        ],
      });

      expect(wrapper.find(c('wallets-header')).text()).toEqual('2 self-custody wallets');
    });

    it('renders wallet list items', () => {
      const wrapper = subject({
        wallets: [
          { id: 'wallet-id-1', publicAddress: 'address-1', isThirdWeb: false },
          { id: 'wallet-id-2', publicAddress: 'address-2', isThirdWeb: false },
        ],
      });

      expect(wrapper.find('WalletListItem')).toHaveLength(2);
      expect(wrapper.find('WalletListItem').at(0).prop('wallet')).toEqual({
        id: 'wallet-id-1',
        publicAddress: 'address-1',
        isThirdWeb: false,
      });
      expect(wrapper.find('WalletListItem').at(1).prop('wallet')).toEqual({
        id: 'wallet-id-2',
        publicAddress: 'address-2',
        isThirdWeb: false,
      });
    });

    it('renders no wallets found alert', () => {
      const wrapper = subject({ wallets: [] });

      expect(wrapper.find('Alert[variant="info"]').exists()).toEqual(true);
      expect(wrapper.find(c('alert-info-text')).text()).toEqual('No wallets found');
    });
  });

  describe('link new wallet', () => {
    it('should render Add Wallet button if user has no wallet linked to his ZERO account', () => {
      const wrapper = subject({ wallets: [] });

      expect(wrapper.find(ConnectButton.Custom).exists()).toEqual(true);
    });

    it('should not render Add Wallet button if user has a wallet linked to his ZERO account', () => {
      const wrapper = subject({ wallets: [{ id: 'wallet-id-1', publicAddress: '0x123', isThirdWeb: false }] });
      expect(wrapper.find(ConnectButton.Custom).exists()).toEqual(false);
    });

    it('should open Link Wallet modal when user clicks on Add Wallet, and metamask is connected', () => {
      const wrapper = subject({
        wallets: [],
        connectedWalletAddr: '0xA100C16E67884Da7d515211Bb065592079bEcde6',
      });

      wrapper.setState({ isUserLinkingNewWallet: true });

      const linkWalletModal = wrapper.find('Modal');
      expect(linkWalletModal.exists()).toEqual(true);
      expect(linkWalletModal.prop('title')).toEqual('Link Wallet');
      expect(linkWalletModal.find(c('link-new-wallet-modal')).text()).toEqual(
        'You have a wallet connected by the address 0xA100C16E67884Da7d515211Bb065592079bEcde6Do you want to link this wallet with your ZERO account?'
      );
    });

    it('should update isUserLinkingNewWallet state to false when user closes Link Wallet modal', () => {
      const wrapper = subject({
        wallets: [],
        connectedWalletAddr: '0x123',
      });

      wrapper.setState({ isUserLinkingNewWallet: true });

      const linkWalletModal = wrapper.find('Modal');
      (linkWalletModal as any).props().onClose();
      expect(wrapper.state('isUserLinkingNewWallet')).toEqual(false);
    });

    it('does not render Link Wallet modal if error is set', () => {
      const wrapper = subject({
        wallets: [],
        connectedWalletAddr: '0x123',
        error: 'An error occurred',
      });
      wrapper.setState({ isUserLinkingNewWallet: true });

      const linkWalletModal = wrapper.find('Modal');
      expect(linkWalletModal.exists()).toEqual(false);
    });

    it('does not render Link Wallet modal if wallet is NOT connected', () => {
      const wrapper = subject({
        wallets: [],
        connectedWalletAddr: null,
      });
      wrapper.setState({ isUserLinkingNewWallet: true });

      const linkWalletModal = wrapper.find('Modal');
      expect(linkWalletModal.exists()).toEqual(false);
    });

    it('calls addNewWallet when user clicks on Link Wallet', () => {
      const addNewWallet = jest.fn();
      const wrapper = subject({
        wallets: [],
        connectedWalletAddr: '0x123',
        addWalletState: State.NONE,
        onAddNewWallet: addNewWallet,
      });
      wrapper.setState({ isUserLinkingNewWallet: true });

      const linkWalletModal = wrapper.find('Modal');
      (linkWalletModal as any).props().onPrimary();

      expect(addNewWallet).toHaveBeenCalled();
    });

    it('keeps Link Wallet button in loading state while IN_PROGRESS', () => {
      const wrapper = subject({
        wallets: [],
        connectedWalletAddr: '0x123',
        addWalletState: State.INPROGRESS,
      });
      wrapper.setState({ isUserLinkingNewWallet: true });

      const linkWalletModal = wrapper.find('Modal');
      expect(linkWalletModal.prop('isProcessing')).toEqual(true);
    });
  });

  describe('thirdweb wallets section', () => {
    it('does not render thirdweb section when no thirdweb wallets exist', () => {
      const wrapper = subject({
        wallets: [],
      });

      const thirdWebWallet = wrapper.find(c('wallets-header')).at(1);
      expect(thirdWebWallet.length).toEqual(0);
    });

    it('renders thirdweb wallets', () => {
      const wrapper = subject({
        wallets: [{ id: 'wallet-id-1', isThirdWeb: true, publicAddress: '0x123' }],
      });

      const thirdWebWallet = wrapper.find(c('wallets-header')).at(1);
      expect(thirdWebWallet.length).toEqual(1);
      expect(thirdWebWallet.text()).toEqual('ZERO Wallet');
      expect(wrapper.find('WalletListItem')).toHaveLength(1);
      expect(wrapper.find('WalletListItem').at(0).prop('wallet')).toEqual({
        id: 'wallet-id-1',
        publicAddress: '0x123',
        isThirdWeb: true,
      });
    });

    it('renders both self-custody and thirdweb wallets', () => {
      const wrapper = subject({
        wallets: [
          { id: 'thirdweb-wallet-id-1', isThirdWeb: true, publicAddress: '0x123' },
          { id: 'self-custody-wallet-id-1', isThirdWeb: false, publicAddress: '0x456' },
        ],
      });

      // 2 wallets in total
      expect(wrapper.find('WalletListItem')).toHaveLength(2);

      // 1 self-custody wallet
      const selfCustodyWallet = wrapper.find(c('wallets-header')).at(0);
      expect(selfCustodyWallet.length).toEqual(1);
      expect(selfCustodyWallet.text()).toEqual('1 self-custody wallet');
      expect(wrapper.find('WalletListItem').at(0).prop('wallet')).toEqual({
        id: 'self-custody-wallet-id-1',
        publicAddress: '0x456',
        isThirdWeb: false,
      });

      // 1 thirdweb wallet
      const thirdWebWallet = wrapper.find(c('wallets-header')).at(1);
      expect(thirdWebWallet.length).toEqual(1);
      expect(thirdWebWallet.text()).toEqual('ZERO Wallet');
      expect(wrapper.find('WalletListItem').at(1).prop('wallet')).toEqual({
        id: 'thirdweb-wallet-id-1',
        publicAddress: '0x123',
        isThirdWeb: true,
      });
    });

    it('renders wallet with correct etherscan link', () => {
      const wallet = { id: 'wallet-id-1', isThirdWeb: true, publicAddress: '0x123' };
      const wrapper = subject({
        wallets: [wallet],
      });

      const walletLink = wrapper.find('a');
      expect(walletLink.prop('href')).toEqual(`https://etherscan.io/address/${wallet.publicAddress}`);
      expect(walletLink.prop('target')).toEqual('_blank');
      expect(walletLink.prop('rel')).toEqual('noopener noreferrer');
    });
  });
});
