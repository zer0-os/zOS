import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { PanelHeader } from '../../list/panel-header';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Alert } from '@zero-tech/zui/components';

import { IconPlus } from '@zero-tech/zui/icons';
import './styles.scss';
import { WalletListItem } from '../../../wallet-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Color, Modal, Variant } from '../../../modal';
import { State as AddWalletState } from '../../../../store/account-management';
import { getChain } from '../../../../lib/web3/thirdweb/client';
import { Wallet } from '../../../../store/authentication/types';

const cn = bemClassName('account-management-panel');

export interface Properties {
  error: string;
  successMessage: string;
  wallets: Wallet[];
  connectedWalletAddr: string;
  addWalletState: AddWalletState;

  onBack: () => void;
  reset: () => void; // reset saga state
  onAddNewWallet: () => void;
}

interface State {
  isUserLinkingNewWallet: boolean;
}

export class AccountManagementPanel extends React.Component<Properties, State> {
  state = {
    isUserLinkingNewWallet: false,
  };

  setIsUserLinkingNewWallet = (isUserLinkingNewWallet: boolean) => {
    this.setState({ isUserLinkingNewWallet });
  };

  back = () => {
    this.props.onBack();
  };

  getSelfCustodyWallets = () => {
    const { wallets } = this.props;
    return wallets.filter((w) => !w.isThirdWeb);
  };

  renderAddNewWalletButton = () => {
    const handleAddWallet = (account, openConnectModal) => {
      this.setIsUserLinkingNewWallet(true);
      this.props.reset();

      if (!account?.address) {
        // Prompt user to connect their wallet if none is connected
        openConnectModal();
      }

      // Otherwise, wallet is already connected, proceed to the next step
    };

    return (
      <div {...cn('add-wallet')}>
        <ConnectButton.Custom>
          {({ account, openConnectModal }) => {
            return (
              <Button
                variant={ButtonVariant.Secondary}
                onPress={() => handleAddWallet(account, openConnectModal)}
                startEnhancer={<IconPlus size={20} isFilled />}
              >
                Add wallet
              </Button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    );
  };

  renderSelfCustodyWalletsSection = () => {
    const wallets = this.getSelfCustodyWallets();

    return (
      <div>
        <div {...cn('wallets-header')}>
          <span>{wallets.length || 'no'}</span> self-custody wallet{wallets.length === 1 ? '' : 's'}
        </div>
        {wallets.length > 0 ? (
          wallets.map((w) => <WalletListItem key={w.id} wallet={w}></WalletListItem>)
        ) : (
          <div {...cn('alert-small')}>
            <Alert variant='info'>
              <div {...cn('alert-info-text')}>No wallets found</div>
            </Alert>
          </div>
        )}

        {wallets.length === 0 && this.renderAddNewWalletButton()}
      </div>
    );
  };

  getThirdWebWallets = () => {
    const { wallets } = this.props;
    return wallets.filter((w) => w.isThirdWeb === true);
  };

  renderThirdWebWalletsSection = () => {
    const wallets = this.getThirdWebWallets();
    if (wallets.length === 0) {
      return null;
    }

    const chain = getChain();
    const explorerUrl = chain?.blockExplorers[0]?.url || 'https://etherscan.io';
    return (
      <div {...cn('thirdweb-wallets-container')}>
        <div {...cn('wallets-header')}>
          <span>ZERO Wallet</span>
        </div>
        {wallets.map((w) => (
          <a key={w.id} href={`${explorerUrl}/address/${w.publicAddress}`} target='_blank' rel='noopener noreferrer'>
            <WalletListItem wallet={w}></WalletListItem>
          </a>
        ))}
      </div>
    );
  };

  renderLinkNewWalletModal = () => {
    const onClose = () => {
      this.setIsUserLinkingNewWallet(false);
    };

    return (
      <Modal
        title='Link Wallet'
        primaryText='Link Wallet'
        primaryVariant={Variant.Primary}
        primaryColor={Color.Highlight}
        secondaryText='Cancel'
        secondaryVariant={Variant.Secondary}
        secondaryColor={Color.Red}
        onPrimary={() => {
          this.props.onAddNewWallet();
        }}
        onSecondary={onClose}
        onClose={onClose}
        isProcessing={this.props.addWalletState === AddWalletState.INPROGRESS}
      >
        <div {...cn('link-new-wallet-modal')}>
          You have a wallet connected by the address{' '}
          <b>
            <i>{this.props.connectedWalletAddr}</i>
          </b>
          <br />
          <br />
          Do you want to link this wallet with your ZERO account?
        </div>
      </Modal>
    );
  };

  get isLinkNewWalletModalOpen() {
    const { connectedWalletAddr, error, addWalletState } = this.props;

    return (
      this.state.isUserLinkingNewWallet &&
      connectedWalletAddr &&
      !error &&
      (addWalletState === AddWalletState.NONE || addWalletState === AddWalletState.INPROGRESS)
    );
  }

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Wallets'} onBack={this.back} />
        </div>

        <ScrollbarContainer variant='on-hover'>
          <div {...cn('panel-content-wrapper')}>
            <div {...cn('content')}>
              {this.renderSelfCustodyWalletsSection()}
              {this.renderThirdWebWalletsSection()}

              {this.props.error && (
                <Alert variant='error' isFilled>
                  <div {...cn('alert-text')}>{this.props.error}</div>
                </Alert>
              )}

              {this.props.successMessage && (
                <Alert variant='success' isFilled>
                  <div {...cn('alert-text')}>{this.props.successMessage}</div>
                </Alert>
              )}
            </div>

            {this.isLinkNewWalletModalOpen && this.renderLinkNewWalletModal()}
          </div>
        </ScrollbarContainer>
      </div>
    );
  }
}
