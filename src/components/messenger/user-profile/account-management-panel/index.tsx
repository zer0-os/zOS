import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { PanelHeader } from '../../list/panel-header';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Alert } from '@zero-tech/zui/components';

import { IconPlus, IconCheck } from '@zero-tech/zui/icons';
import './styles.scss';
import { WalletListItem } from '../../../wallet-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Color, Modal, Variant } from '../../../modal';
import { State as AddWalletState } from '../../../../store/account-management';
import { Wallet } from '../../../../store/authentication/types';

const cn = bemClassName('account-management-panel');

export interface Properties {
  error: string;
  successMessage: string;
  wallets: Wallet[];
  connectedWalletAddr: string;
  addWalletState: AddWalletState;
  zeroWalletAddress: string;
  isRemoveWalletModalOpen?: boolean;
  walletIdPendingRemoval?: string;
  removeRequiresTransferConfirmation?: boolean;
  isRemovingWallet?: boolean;
  addWalletCanAuthenticate?: boolean;
  addWalletRequiresTransferConfirmation?: boolean;

  onBack: () => void;
  reset: () => void; // reset saga state
  onAddNewWallet: () => void;
  onRemoveWallet?: (walletId: string) => void;
  onConfirmRemoveWallet?: (confirm?: boolean) => void;
  onCloseRemoveWalletModal?: () => void;
  onToggleAddWalletCanAuthenticate?: (value: boolean) => void;
  onConfirmAddNewWallet?: () => void;
  onCloseLinkNewWalletModal?: () => void;
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
          wallets.map((w) => (
            <WalletListItem
              key={w.id}
              wallet={w}
              onRemove={this.props.onRemoveWallet ? () => this.props.onRemoveWallet(w.id) : undefined}
              tag={w.canAuthenticate ? 'Authenticator' : undefined}
              tagDescription={w.canAuthenticate ? 'This wallet can be used to log into your ZERO account' : undefined}
            ></WalletListItem>
          ))
        ) : (
          <div {...cn('alert-small')}>
            <Alert variant='info'>
              <div {...cn('alert-info-text')}>No wallets found</div>
            </Alert>
          </div>
        )}
        {this.renderAddNewWalletButton()}
      </div>
    );
  };

  renderRemoveWalletModal = () => {
    if (!this.props.isRemoveWalletModalOpen) {
      return null;
    }

    const title = this.props.removeRequiresTransferConfirmation ? 'Transfer Wallet' : 'Remove Wallet';
    const primaryText = this.props.removeRequiresTransferConfirmation ? 'Transfer and Remove' : 'Remove';
    const body = this.props.removeRequiresTransferConfirmation ? (
      <div {...cn('link-new-wallet-modal')}>
        <div>
          <div {...cn('alert-info-text-warning')}>
            This wallet is linked to another account. Do you want to remove it from that account and link it here?
          </div>
        </div>
        <div>Calling remove will transfer it. You can undo by linking it back later.</div>
      </div>
    ) : (
      <div {...cn('link-new-wallet-modal')}>
        <div>Are you sure you want to remove this wallet from your ZERO account?</div>
      </div>
    );

    return (
      <Modal
        title={title}
        primaryText={primaryText}
        primaryVariant={Variant.Primary}
        primaryColor={Color.Highlight}
        secondaryText={'Cancel'}
        secondaryVariant={Variant.Secondary}
        secondaryColor={Color.Red}
        onPrimary={() => this.props.onConfirmRemoveWallet?.(this.props.removeRequiresTransferConfirmation)}
        onSecondary={this.props.onCloseRemoveWalletModal}
        onClose={this.props.onCloseRemoveWalletModal}
        isProcessing={this.props.isRemovingWallet}
      >
        {this.props.error && (
          <div {...cn('alert-small')}>
            <Alert variant='error'>
              <div {...cn('alert-text')}>{this.props.error}</div>
            </Alert>
          </div>
        )}
        {body}
      </Modal>
    );
  };

  renderThirdWebWalletsSection = () => {
    const explorerUrl = 'https://zscan.live';
    return (
      <div {...cn('thirdweb-wallets-container')}>
        <div {...cn('wallets-header')}>
          <span>ZERO Wallet</span>
        </div>
        <a href={`${explorerUrl}/address/${this.props.zeroWalletAddress}`} target='_blank' rel='noopener noreferrer'>
          <WalletListItem
            wallet={{
              id: 'zero-wallet',
              publicAddress: this.props.zeroWalletAddress,
              isThirdWeb: true,
            }}
          ></WalletListItem>
        </a>
      </div>
    );
  };

  renderLinkNewWalletModal = () => {
    const onClose = () => {
      this.setIsUserLinkingNewWallet(false);
      this.props.onCloseLinkNewWalletModal?.();
    };
    const wallets = this.getSelfCustodyWallets();
    const isWalletAlreadyLinked = wallets.some(
      (w) => w.publicAddress.toLowerCase() === this.props.connectedWalletAddr.toLowerCase()
    );

    return (
      <Modal
        title={this.props.addWalletRequiresTransferConfirmation ? 'Transfer Wallet' : 'Link Wallet'}
        primaryText={this.props.addWalletRequiresTransferConfirmation ? 'Transfer and Link' : 'Link Wallet'}
        primaryVariant={Variant.Primary}
        primaryColor={Color.Highlight}
        secondaryText='Cancel'
        secondaryVariant={Variant.Secondary}
        secondaryColor={Color.Red}
        onPrimary={() => {
          if (this.props.addWalletRequiresTransferConfirmation) {
            this.props.onConfirmAddNewWallet?.();
          } else {
            this.props.onAddNewWallet();
          }
        }}
        onSecondary={onClose}
        primaryDisabled={isWalletAlreadyLinked}
        onClose={onClose}
        isProcessing={this.props.addWalletState === AddWalletState.INPROGRESS}
      >
        {isWalletAlreadyLinked ? (
          <div {...cn('link-new-wallet-modal')}>
            <div>
              <div {...cn('alert-info-text')}>This wallet is already linked to your ZERO account</div>
              <div>
                <b>
                  <i>{this.props.connectedWalletAddr}</i>
                </b>
              </div>
            </div>
            <div>Switch to another wallet to link a new one</div>
          </div>
        ) : (
          <div {...cn('link-new-wallet-modal')}>
            <div>
              <div>Your currently connected wallet has the address:</div>
              <div>
                <b>
                  <i>{this.props.connectedWalletAddr}</i>
                </b>
              </div>
            </div>
            {this.props.addWalletRequiresTransferConfirmation ? (
              <div {...cn('alert-info-text-warning')}>
                This wallet is linked to another account. Do you want to transfer it to this account?
              </div>
            ) : (
              <div>Do you want to link this wallet with your ZERO account?</div>
            )}
            <label {...cn('checkbox-label-wrapper')} onClick={(e) => e.stopPropagation()}>
              <input
                {...cn('checkbox')}
                type='checkbox'
                checked={this.props.addWalletCanAuthenticate !== false}
                onChange={(e) => this.props.onToggleAddWalletCanAuthenticate?.(e.target.checked)}
              />
              {this.props.addWalletCanAuthenticate !== false && (
                <IconCheck {...cn('checkbox-icon')} size={14} isFilled />
              )}
              Enable logging into your ZERO account with this wallet
            </label>
          </div>
        )}
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
            {this.renderRemoveWalletModal()}
          </div>
        </ScrollbarContainer>
      </div>
    );
  }
}
