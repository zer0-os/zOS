import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { PanelHeader } from '../../list/panel-header';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Alert, Modal, IconButton } from '@zero-tech/zui/components';

import { IconPlus } from '@zero-tech/zui/icons';
import './styles.scss';
import { WalletListItem } from '../../../wallet-list-item';
import { CitizenListItem } from '../../../citizen-list-item';
import { IconXClose } from '@zero-tech/zui/icons';
import { CreateEmailAccountContainer } from '../../../../authentication/create-email-account/container';
import { ScrollbarContainer } from '../../../scrollbar-container';

const cn = bemClassName('account-management-panel');

export interface Properties {
  isAddEmailModalOpen: boolean;
  error: string;
  successMessage: string;
  currentUser: any;
  canAddEmail: boolean;

  onBack: () => void;
  onOpenAddEmailModal: () => void;
  onCloseAddEmailModal: () => void;
}

export class AccountManagementPanel extends React.Component<Properties> {
  back = () => {
    this.props.onBack();
  };

  // note: hiding this for now
  renderAddNewWalletButton = () => {
    return (
      <div {...cn('add-wallet')}>
        <Button variant={ButtonVariant.Secondary} onPress={() => {}} startEnhancer={<IconPlus size={20} isFilled />}>
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
      <Modal
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
          </div>
        </ScrollbarContainer>
      </div>
    );
  }
}
