import React, { Component, createRef } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

import {
  DropdownMenu,
  Modal,
  IconButton,
  Button,
  Variant as ButtonVariant,
  Color as ButtonColor,
} from '@zero-tech/zui/components';
import { IconDotsHorizontal, IconEdit5, IconFlipBackward, IconTrash4, IconXClose } from '@zero-tech/zui/icons';
import './styles.scss';

interface Properties {
  className?: string;
  canEdit: boolean;
  canDelete: boolean;
  canReply?: boolean;
  isMediaMessage?: boolean;
}

interface State {
  menuOpen: boolean;
  deleteDialogOpen: boolean;
  menuPosition: { x: number; y: number };
}

class DropMenu extends Component<Properties, State> {
  state: State = {
    menuOpen: false,
    deleteDialogOpen: false,
    menuPosition: { x: 0, y: 0 },
  };

  ref = createRef<HTMLDivElement>();

  handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    this.setState({
      menuOpen: true,
      menuPosition: { x: event.clientX, y: event.clientY },
    });
  };

  handleCloseMenu = () => {
    this.setState({ menuOpen: false });
  };

  toggleDeleteDialog = () => {
    this.setState((prevState) => ({
      deleteDialogOpen: !prevState.deleteDialogOpen,
    }));
  };

  handleDeleteMessage = () => {
    console.log('Message deleted');
    this.toggleDeleteDialog();
  };

  renderMenuOption = (icon: JSX.Element, label: string) => (
    <div className={'option'}>
      {icon} {label}
    </div>
  );

  renderItems = () => {
    const { canEdit, canDelete, canReply, isMediaMessage } = this.props;
    const items = [];

    if (canEdit && !isMediaMessage) {
      items.push({
        id: 'edit',
        label: this.renderMenuOption(<IconEdit5 size={20} />, 'Edit'),
        onSelect: () => console.log('Edit selected'),
      });
    }

    if (canReply && !isMediaMessage) {
      items.push({
        id: 'reply',
        label: this.renderMenuOption(<IconFlipBackward size={20} />, 'Reply'),
        onSelect: () => console.log('Reply selected'),
      });
    }

    if (canDelete) {
      items.push({
        id: 'delete',
        label: this.renderMenuOption(<IconTrash4 size={20} />, 'Delete'),
        onSelect: this.toggleDeleteDialog,
      });
    }

    return items;
  };

  renderDeleteModal = () => {
    if (!this.state.deleteDialogOpen) return null;

    return (
      <Modal className='delete-message-modal' open={true} onOpenChange={this.toggleDeleteDialog}>
        <div className='delete-message-modal__header'>
          <h2>Delete Message</h2>
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
            Delete Message
          </Button>
        </div>
      </Modal>
    );
  };

  render() {
    const { className } = this.props;
    const { menuOpen, menuPosition } = this.state;
    const items = this.renderItems();

    if (!items.length) return null;

    return (
      <div ref={this.ref} className={className} onContextMenu={this.handleContextMenu}>
        {menuOpen && (
          <DropdownMenu
            menuClassName={'dropdown-menu'}
            items={items}
            side='bottom'
            alignMenu='center'
            onOpenChange={this.handleCloseMenu}
            open={menuOpen}
            showArrow
            position={{ x: menuPosition.x, y: menuPosition.y }}
          />
        )}
        {this.renderDeleteModal()}
      </div>
    );
  }
}

export default DropMenu;
