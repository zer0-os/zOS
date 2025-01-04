import React, { createRef } from 'react';
import { createPortal } from 'react-dom';
import { Picker } from 'emoji-mart';

import { IconButton } from '@zero-tech/zui/components';
import { IconHeart } from '@zero-tech/zui/icons';
import { ViewModes } from '../../shared-components/theme-engine';

import './styles.scss';
import classNames from 'classnames';

export interface Properties {
  isOwner: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onSelectReaction: (emoji) => void;
}

export interface State {
  isEmojiPickerOpen: boolean;
  isProcessing: boolean;
}

export class ReactionMenu extends React.Component<Properties, State> {
  triggerRef = createRef<HTMLDivElement>();
  emojiPickerRef = createRef<HTMLDivElement>();

  state = {
    isEmojiPickerOpen: false,
    isProcessing: false,
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.onClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onClickOutside);
  }

  onClickOutside = (event) => {
    if (this.state.isProcessing) return;

    if (
      !(
        (this.triggerRef.current && this.triggerRef.current.contains(event.target)) ||
        (this.emojiPickerRef.current && this.emojiPickerRef.current.contains(event.target))
      )
    ) {
      this.setState(
        {
          isEmojiPickerOpen: false,
          isProcessing: false,
        },
        () => {
          this.props.onOpenChange?.(false);
        }
      );
    }
  };

  toggleEmojiPicker = () => {
    this.setState((prevState) => ({
      isEmojiPickerOpen: !prevState.isEmojiPickerOpen,
    }));
  };

  renderEmojiPicker() {
    return createPortal(
      <div
        className={classNames('emoji-picker', this.props.isOwner && 'emoji-picker--owner')}
        ref={this.emojiPickerRef}
      >
        <Picker
          emoji='mechanical_arm'
          title='ZOS'
          theme={ViewModes.Dark}
          onSelect={(emoji) => this.insertEmoji(emoji)}
        />
      </div>,
      document.body
    );
  }

  insertEmoji = (emoji: any) => {
    if (emoji && emoji.native) {
      this.props.onSelectReaction(emoji.native);
      this.toggleEmojiPicker();
    }
  };

  render() {
    const { isEmojiPickerOpen } = this.state;

    return (
      <div className='reaction-menu'>
        <div ref={this.triggerRef}>
          <IconButton className={'reaction-menu-trigger'} Icon={IconHeart} size={32} onClick={this.toggleEmojiPicker} />
        </div>

        {isEmojiPickerOpen && this.renderEmojiPicker()}
      </div>
    );
  }
}
