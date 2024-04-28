import React, { createRef } from 'react';
import { createPortal } from 'react-dom';

import { DropdownMenu, Modal, IconButton } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant, Color as ButtonColor } from '@zero-tech/zui/components/Button';
import { IconDotsHorizontal, IconEdit5, IconFlipBackward, IconTrash4, IconXClose } from '@zero-tech/zui/icons';

import classNames from 'classnames';
import './styles.scss';

export interface Properties {
  className: string;
  canEdit: boolean;
  canDelete: boolean;
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
  contextMenuPosition: { x: number; y: number };
}

export class MessageMenu extends React.Component<Properties, State> {
  ref = createRef();

  state = { deleteDialogIsOpen: false, contextMenuPosition: { x: 0, y: 0 } };

  handleContextMenu = (event) => {
    event.preventDefault();
    const { clientX: x, clientY: y } = event;

    this.setState({ contextMenuPosition: { x, y } }, () => {
      this.props.onOpenChange && this.props.onOpenChange(true);
    });
  };

  renderMenuOption(icon, label) {
    return (
      <div className={'option'}>
        {icon} {label}
      </div>
    );
  }

  // Our zUI DropdownMenu component actively steals focus.
  // In order to allow actions to change focus without the dropdown menu stealing it back,
  // we delay publishing the event by releasing the thread for a single tick.
  delayEvent = (handler) => setTimeout(handler, 1);
  onEdit = () => this.delayEvent(this.props.onEdit);
  onReply = () => this.delayEvent(this.props.onReply);

  renderItems = () => {
    const { onEdit, canEdit, onReply, canReply, onDelete, canDelete, isMediaMessage } = this.props;

    const itemConfig = [
      {
        id: 'edit',
        condition: onEdit && canEdit && !isMediaMessage,
        icon: <IconEdit5 size={20} />,
        label: 'Edit',
        onSelect: this.onEdit,
      },
      {
        id: 'reply',
        condition: onReply && canReply && !isMediaMessage,
        icon: <IconFlipBackward size={20} />,
        label: 'Reply',
        onSelect: this.onReply,
      },
      {
        id: 'delete',
        condition: onDelete && canDelete,
        icon: <IconTrash4 size={20} />,
        label: 'Delete',
        onSelect: this.toggleDeleteDialog,
      },
    ];

    return itemConfig
      .filter((item) => item.condition)
      .map((item) => ({
        id: item.id,
        label: this.renderMenuOption(item.icon, item.label),
        onSelect: item.onSelect,
      }));
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

  renderTrigger = () => {
    const { isMenuOpen } = this.props;
    const { x, y } = this.state.contextMenuPosition;
    return (
      <div
        className={classNames('dropdown-menu-trigger', { 'dropdown-menu-trigger--open': isMenuOpen })}
        style={{ position: 'fixed', left: `${x}px`, top: `${y}px` }}
      >
        <IconDotsHorizontal size={24} isFilled />
      </div>
    );
  };

  renderUnderlay = () =>
    createPortal(<div className='dropdown-menu__underlay' onClick={this.props.onCloseMenu} />, document.body);

  renderDeleteModal() {
    return (
      <Modal className='delete-message-modal' open={this.showDeleteModal} onOpenChange={this.toggleDeleteDialog}>
        <div className='delete-message-modal__header'>
          <h2>Delete message</h2>
          <IconButton Icon={IconXClose} size='large' onClick={this.toggleDeleteDialog} />
        </div>
        <div className='delete-message-text-content'>
          Are you sure you want to delete this message? This cannot be undone.
        </div>
        <div className='delete-message-modal__footer'>
          <Button variant={ButtonVariant.Secondary} color={ButtonColor.Greyscale} onPress={this.toggleDeleteDialog}>
            Cancel
          </Button>

          <Button color={ButtonColor.Red} onPress={this.handleDeleteMessage}>
            Delete message
          </Button>
        </div>
      </Modal>
    );
  }

  render() {
    const menuItems = this.renderItems();

    if (!menuItems.length) {
      return null;
    }

    return (
      <div className={this.props.className} onContextMenu={this.handleContextMenu}>
        {this.props.isMenuOpen && this.renderUnderlay()}
        <DropdownMenu
          menuClassName={'dropdown-menu'}
          items={menuItems}
          side='bottom'
          alignMenu='center'
          onOpenChange={this.props.onOpenChange}
          showArrow
          trigger={this.renderTrigger()}
        />
        {this.renderDeleteModal()}
      </div>
    );
  }
}
