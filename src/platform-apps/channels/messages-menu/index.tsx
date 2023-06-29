import { IconDotsHorizontal } from '@zero-tech/zui/icons';
import { ModalConfirmation } from '@zero-tech/zui/components';
import React from 'react';
import { IconButton } from '../../../components/icon-button';
import PortalMenu from './portal-menu';

import './styles.scss';

interface Properties {
  className: string;
  canEdit: boolean;
  canReply?: boolean;
  isMediaMessage?: boolean;

  onDelete?: () => void;
  onEdit?: () => void;
  onReply?: () => void;
}

export interface State {
  isOpen: boolean;
  deleteDialogIsOpen: boolean;
}

export class MessageMenu extends React.Component<Properties, State> {
  state = { isOpen: false, deleteDialogIsOpen: false };

  open = (): void => {
    this.setState({ isOpen: true });
  };

  renderItems = () => {
    const menuItems = [];

    if (this.props.onReply && this.props.canReply && !this.props.isMediaMessage) {
      menuItems.push(
        <li className='menu-button reply-item' key='reply' onClick={this.props.onReply}>
          <span>Reply</span>
        </li>
      );
    }
    if (this.props.onDelete && this.props.canEdit) {
      menuItems.push(
        <li className='menu-button delete-item' key='delete' onClick={this.toggleDeleteDialog}>
          <span>Delete</span>
        </li>
      );
    }
    if (this.props.onEdit && this.props.canEdit && !this.props.isMediaMessage) {
      menuItems.push(
        <li className='menu-button edit-item' key='edit' onClick={this.props.onEdit}>
          <span>Edit</span>
        </li>
      );
    }

    return menuItems;
  };

  close = () => this.setState({ isOpen: false });

  delete = () => {
    this.setState({
      deleteDialogIsOpen: false,
    });
    this.props.onDelete();
  };

  toggleDeleteDialog = () => {
    this.setState({
      deleteDialogIsOpen: !this.state.deleteDialogIsOpen,
    });
  };

  get showDeleteModal(): boolean {
    return this.state.deleteDialogIsOpen;
  }

  get showEditInput(): boolean {
    return this.state.deleteDialogIsOpen;
  }

  renderDeleteModal() {
    return (
      <ModalConfirmation
        open
        onCancel={this.toggleDeleteDialog}
        onConfirm={this.delete}
        title='Delete Message'
        cancelLabel='Cancel'
        confirmationLabel='ok'
      >
        Are you sure you want to delete this message?
      </ModalConfirmation>
    );
  }

  render() {
    const menuItems = this.renderItems();

    if (!menuItems.length) {
      return null;
    }

    return (
      <div className={this.props.className}>
        <IconButton
          className='portal-menu-button-icon'
          onClick={this.open}
          Icon={IconDotsHorizontal}
          size={24}
          isFilled
        />
        <PortalMenu className='portal-menu' onClose={this.close} isOpen={this.state.isOpen}>
          {menuItems}
        </PortalMenu>
        {this.showDeleteModal && this.renderDeleteModal()}
      </div>
    );
  }
}

export default MessageMenu;
