import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { PanelHeader } from '../../list/panel-header';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Alert, Modal } from '@zero-tech/zui/components';

import { IconPlus } from '@zero-tech/zui/icons';
import './styles.scss';
import { WalletSelect } from '../../../wallet-select';
import { WalletListItem } from '../../../wallet-list-item';
import { CitizenListItem } from '../../../citizen-list-item';

const cn = bemClassName('account-management-panel');

export interface Properties {
  isModalOpen: boolean;
  error: string;
  currentUser: any;
  canAddEmail: boolean;

  onBack: () => void;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onSelect: (connector: any) => void;
}

export class AccountManagementPanel extends React.Component<Properties> {
  back = () => {
    this.props.onBack();
  };

  renderWalletSelectModal = () => {
    return (
      <Modal
        open={this.props.isModalOpen}
        onOpenChange={(isOpen) => {
          isOpen ? this.props.onOpenModal() : this.props.onCloseModal();
        }}
      >
        <div {...cn('wallet-select-modal')}>
          <WalletSelect isConnecting={false} onSelect={this.props.onSelect} />
        </div>
      </Modal>
    );
  };

  // note: hiding this for now
  renderAddNewWalletButton = () => {
    return (
      <div {...cn('add-wallet')}>
        <Button
          variant={ButtonVariant.Secondary}
          onPress={this.props.onOpenModal}
          startEnhancer={<IconPlus size={20} isFilled />}
        >
          Add new wallet
        </Button>
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
          <CitizenListItem
            user={{ ...currentUser, firstName: currentUser.primaryEmail }}
            tag={''}
            onSelected={() => {}}
          />
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
              onPress={() => {}}
              startEnhancer={<IconPlus size={20} isFilled />}
            >
              Add email
            </Button>
          </div>
        )}
      </div>
    );
  };

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Accounts'} onBack={this.back} />
        </div>

        <div {...cn('content')}>
          {this.renderWalletsSection()}
          {this.renderEmailSection()}

          {this.props.error && (
            <Alert variant='error' isFilled>
              <div {...cn('alert-text')}>{this.props.error}</div>
            </Alert>
          )}
        </div>

        {this.renderWalletSelectModal()}
      </div>
    );
  }
}
