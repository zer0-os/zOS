import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { PanelHeader } from '../../list/panel-header';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Alert, Modal as ZuiModal, IconButton } from '@zero-tech/zui/components';

import { IconPlus } from '@zero-tech/zui/icons';
import './styles.scss';
import { WalletListItem } from '../../../wallet-list-item';
import { CitizenListItem } from '../../../citizen-list-item';
import { IconXClose } from '@zero-tech/zui/icons';
import { CreateEmailAccountContainer } from '../../../../authentication/create-email-account/container';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Color, Modal, Variant } from '../../../modal';
import { featureFlags } from '../../../../lib/feature-flags';

const cn = bemClassName('account-management-panel');

export interface Properties {
  isAddEmailModalOpen: boolean;
  error: string;
  successMessage: string;
  currentUser: any;
  canAddEmail: boolean;
  isWalletConnected: boolean;
  connectedWallet: string;

  onBack: () => void;
  onOpenAddEmailModal: () => void;
  onCloseAddEmailModal: () => void;
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

  renderAddNewWalletButton = () => {
    const handleAddWallet = (account, openConnectModal) => {
      this.setIsUserLinkingNewWallet(true);

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

  renderWalletsSection = () => {
    const { currentUser } = this.props;
    const wallets = currentUser?.wallets || [];

    return (
      <div>
        <div {...cn('wallets-header')}>
          <span>{wallets.length || 'no'}</span> wallet{wallets.length === 1 ? '' : 's'}
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

        {featureFlags.enableAddWallets && wallets.length === 0 && this.renderAddNewWalletButton()}
      </div>
    );
  };

  renderEmailSection = () => {
    const { currentUser } = this.props;

    return (
      <div {...cn('email-container')}>
        <div {...cn('email-header')}>
          <span>Email</span>
        </div>

        {currentUser?.primaryEmail ? (
          <CitizenListItem user={{ ...currentUser, firstName: currentUser.primaryEmail }} tag={''} />
        ) : (
          <div {...cn('alert-small')}>
            <Alert variant='info'>
              <div {...cn('alert-info-text')}>No email account found</div>
            </Alert>
          </div>
        )}

        {this.props.canAddEmail && (
          <div>
            <Button
              variant={ButtonVariant.Secondary}
              onPress={this.props.onOpenAddEmailModal}
              startEnhancer={<IconPlus size={20} isFilled />}
            >
              Add email
            </Button>
          </div>
        )}
      </div>
    );
  };

  renderAddEmailAccountModal = () => {
    return (
      <ZuiModal
        open={this.props.isAddEmailModalOpen}
        onOpenChange={(isOpen) => {
          isOpen ? this.props.onOpenAddEmailModal() : this.props.onCloseAddEmailModal();
        }}
        {...cn('add-email-modal')}
      >
        <div {...cn('add-email-body')}>
          <div {...cn('add-email-title-bar')}>
            <h3 {...cn('add-email-title')}>Add Email</h3>
            <IconButton
              {...cn('add-email-close')}
              size='large'
              Icon={IconXClose}
              onClick={this.props.onCloseAddEmailModal}
            />
          </div>

          <CreateEmailAccountContainer addAccount />
        </div>
      </ZuiModal>
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
        onPrimary={() => {}}
        onSecondary={onClose}
        onClose={onClose}
        isProcessing={false}
      >
        <div {...cn('link-new-wallet-modal')}>
          You have a wallet connected by the address{' '}
          <b>
            <i>{this.props.connectedWallet}</i>
          </b>
          <br />
          <br />
          Do you want to link this wallet with your ZERO account?
        </div>
      </Modal>
    );
  };

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Accounts'} onBack={this.back} />
        </div>

        <ScrollbarContainer variant='on-hover'>
          <div {...cn('panel-content-wrapper')}>
            <div {...cn('content')}>
              {this.renderWalletsSection()}
              {this.renderEmailSection()}

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

            {this.renderAddEmailAccountModal()}
            {this.state.isUserLinkingNewWallet && this.props.isWalletConnected && this.renderLinkNewWalletModal()}
          </div>
        </ScrollbarContainer>
      </div>
    );
  }
}
