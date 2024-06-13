import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { PanelHeader } from '../../list/panel-header';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Alert, Modal } from '@zero-tech/zui/components';

import { IconPlus } from '@zero-tech/zui/icons';
import './styles.scss';
import { WalletSelect } from '../../../wallet-select';

const cn = bemClassName('wallets-panel');

export interface Properties {
  isModalOpen: boolean;
  error: string;

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

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Accounts'} onBack={this.back} />
        </div>

        <div {...cn('content')}>
          <div {...cn('footer')}>
            <Button
              variant={ButtonVariant.Secondary}
              onPress={this.props.onOpenModal}
              startEnhancer={<IconPlus size={20} isFilled />}
            >
              Add new wallet
            </Button>
          </div>

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
