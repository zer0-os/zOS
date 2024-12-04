import React, { createRef } from 'react';
import { createPortal } from 'react-dom';

import { DropdownMenu } from '@zero-tech/zui/components';
import {
  IconAlertCircle,
  IconDotsHorizontal,
  IconEdit5,
  IconFlipBackward,
  IconInfoCircle,
  IconTrash4,
  IconDownload2,
  IconCopy2,
} from '@zero-tech/zui/icons';

import classNames from 'classnames';
import './styles.scss';

export interface Properties {
  className: string;
  canEdit: boolean;
  canDelete: boolean;
  canReply?: boolean;
  canReportUser?: boolean;
  canViewInfo?: boolean;
  canDownload?: boolean;
  canCopy?: boolean;
  isMenuOpen?: boolean;
  isMenuFlying?: boolean;

  onOpenChange?: (isOpen: boolean) => void;
  onCloseMenu?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReply?: () => void;
  onInfo?: () => void;
  onDownload?: () => void;
  onCopy?: () => void;
  onReportUser?: () => void;
}

export class MessageMenu extends React.Component<Properties> {
  ref = createRef();

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

  onInfo = () => {
    this.props.onInfo();
  };

  renderItems = () => {
    const menuItems = [];

    if (this.props.onEdit && this.props.canEdit) {
      menuItems.push({
        id: 'edit',
        label: this.renderMenuOption(<IconEdit5 size={20} />, 'Edit'),
        onSelect: this.onEdit,
      });
    }
    if (this.props.onReply && this.props.canReply) {
      menuItems.push({
        id: 'reply',
        label: this.renderMenuOption(<IconFlipBackward size={20} />, 'Reply'),
        onSelect: this.onReply,
      });
    }
    if (this.props.onInfo && this.props.canViewInfo) {
      menuItems.push({
        id: 'info',
        label: this.renderMenuOption(<IconInfoCircle size={20} />, 'Info'),
        onSelect: this.onInfo,
      });
    }
    if (this.props.onDownload && this.props.canDownload) {
      menuItems.push({
        id: 'download',
        label: this.renderMenuOption(<IconDownload2 size={20} />, 'Download'),
        onSelect: this.props.onDownload,
      });
    }
    if (this.props.onCopy && this.props.canCopy) {
      menuItems.push({
        id: 'copy',
        label: this.renderMenuOption(<IconCopy2 size={20} />, 'Copy'),
        onSelect: this.props.onCopy,
      });
    }
    if (this.props.onDelete && this.props.canDelete) {
      menuItems.push({
        id: 'delete',
        label: this.renderMenuOption(<IconTrash4 size={20} />, 'Delete'),
        onSelect: this.props.onDelete,
      });
    }
    if (this.props.onReportUser && this.props.canReportUser) {
      menuItems.push({
        id: 'reportUser',
        label: this.renderMenuOption(<IconAlertCircle color='red' size={20} />, 'Report'),
        onSelect: this.props.onReportUser,
      });
    }

    return menuItems;
  };

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
          open={this.props.isMenuOpen}
          showArrow
          trigger={
            !this.props.isMenuFlying ? (
              <div
                className={classNames('dropdown-menu-trigger', {
                  'dropdown-menu-trigger--open': this.props.isMenuOpen,
                })}
              >
                <IconDotsHorizontal size={24} isFilled />
              </div>
            ) : (
              <></>
            )
          }
        />
      </div>
    );
  }
}
