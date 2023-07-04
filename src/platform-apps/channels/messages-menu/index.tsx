import React, { createRef } from 'react';
import { createPortal } from 'react-dom';

import { ModalConfirmation, DropdownMenu } from '@zero-tech/zui/components';
import { IconDotsHorizontal, IconEdit5, IconFlipBackward, IconTrash4 } from '@zero-tech/zui/icons';

import classNames from 'classnames';
import './styles.scss';

interface Properties {
  className: string;
  canEdit: boolean;
  canReply?: boolean;
  isMediaMessage?: boolean;
  isMenuOpen?: boolean;

  onOpenChange?: (isOpen: boolean) => void;
  onCloseMenu?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReply?: () => void;
}

export interface State {
  deleteDialogIsOpen: boolean;
}

export class MessageMenu extends React.Component<Properties, State> {
  ref = createRef();

  state = { deleteDialogIsOpen: false };

  renderMenuOption(icon, label) {
    return (
      <div className={'option'}>
        {label} {icon}
      </div>
    );
  }

  renderItems = () => {
    const menuItems = [];
    if (this.props.onEdit && this.props.canEdit && !this.props.isMediaMessage) {
      menuItems.push({
        id: 'edit',
        label: this.renderMenuOption(<IconEdit5 />, 'Edit'),
        onSelect: this.props.onEdit,
      });
    }
    if (this.props.onReply && this.props.canReply && !this.props.isMediaMessage) {
      menuItems.push({
        id: 'reply',
        label: this.renderMenuOption(<IconFlipBackward />, 'Reply'),
        onSelect: this.props.onReply,
      });
    }
    if (this.props.onDelete && this.props.canEdit) {
      menuItems.push({
        id: 'delete',
        label: this.renderMenuOption(<IconTrash4 />, 'Delete'),
        onSelect: this.toggleDeleteDialog,
      });
    }

    return menuItems;
  };

  handleDeleteMessage = () => {
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

  renderDeleteModal() {
    return (
      <ModalConfirmation
        className='delete-message-modal'
        open
        onCancel={this.toggleDeleteDialog}
        onConfirm={this.handleDeleteMessage}
        title='Delete message'
        cancelLabel='Cancel'
        confirmationLabel='Delete message'
      >
        <div className='delete-message-modal__text-content'>
          Are you sure you want to delete this message? This cannot be undone.
        </div>
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
        {this.props.isMenuOpen &&
          createPortal(<div className='dropdown-menu__underlay' onClick={this.props.onCloseMenu} />, document.body)}

        <DropdownMenu
          menuClassName={'dropdown-menu'}
          items={menuItems}
          side='bottom'
          alignMenu='center'
          onOpenChange={this.props.onOpenChange}
          trigger={
            <div
              className={classNames('dropdown-menu-trigger', {
                'dropdown-menu-trigger--open': this.props.isMenuOpen,
              })}
            >
              <IconDotsHorizontal size={24} isFilled />
            </div>
          }
        />
        {this.showDeleteModal && this.renderDeleteModal()}
      </div>
    );
  }
}
