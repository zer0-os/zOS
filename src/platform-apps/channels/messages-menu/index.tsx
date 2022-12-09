import { Dialog } from '@zer0-os/zos-component-library';
import classNames from 'classnames';
import React from 'react';
import PortalMenu from './portal-menu';

import './styles.scss';

interface Properties {
  className: string;
  canEdit: boolean;

  onDelete?: () => void;
  onEdit?: () => void;
}

export interface State {
  isOpen: boolean;
  deleteDialogIsOpen: boolean;
}

export class MessageMenu extends React.Component<Properties> {
  state = { isOpen: false, deleteDialogIsOpen: false };

  open = () => {
    this.setState({ isOpen: true });
  };

  renderItems = () => {
    const menuItems = [];

    if (this.props.onDelete && this.props.canEdit) {
      menuItems.push(
        <li
          className='menu-button delete-item'
          key='delete'
          onClick={this.toggleDeleteDialog}
        >
          <span>Delete</span>
        </li>
      );
    }
    if (this.props.onEdit && this.props.canEdit) {
      menuItems.push(
        <li
          className='menu-button edit-item'
          key='edit'
          onClick={this.props.onEdit}
        >
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
      <Dialog
        className='confirm-dialog__message'
        onClose={this.toggleDeleteDialog}
      >
        <div className={classNames('confirm-delete', 'border-primary')}>
          <div className='confirm-delete__header'>
            <h3 className='glow-text'>Delete Message</h3>
          </div>
          <hr className='glow' />
          <p className='confirm-delete__body'>Are you sure you want to delete this message?</p>
          <hr className='glow' />
          <div className='confirm-delete__footer'>
            <button
              onClick={this.delete}
              className='confirm-delete__footer-button'
            >
              Ok
            </button>
            <button
              onClick={this.toggleDeleteDialog}
              className='confirm-delete__footer-button'
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>
    );
  }

  render() {
    const menuItems = this.renderItems();

    if (!menuItems.length) {
      return null;
    }

    return (
      <span className={this.props.className}>
        <div
          className='message__menu-item__icon'
          onClick={this.open}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='1em'
            height='1em'
            preserveAspectRatio='xMidYMid meet'
            viewBox='0 0 512 512'
          >
            <g transform='rotate(90 256 256)'>
              <path
                fill='currentColor'
                d='M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72s32.2-72 72-72s72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72s72-32.2 72-72s-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72s72-32.2 72-72s-32.2-72-72-72z'
              />
            </g>
          </svg>
        </div>
        <PortalMenu
          className='portal-menu'
          onClose={this.close}
          isOpen={this.state.isOpen}
        >
          {menuItems}
        </PortalMenu>
        {this.showDeleteModal && this.renderDeleteModal()}
      </span>
    );
  }
}

export default MessageMenu;
