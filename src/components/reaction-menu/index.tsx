import React, { createRef } from 'react';
import { createPortal } from 'react-dom';
import { Emoji, Picker } from 'emoji-mart';

import { IconButton } from '@zero-tech/zui/components';
import { IconDotsHorizontal, IconHeart } from '@zero-tech/zui/icons';
import { ViewModes } from '../../shared-components/theme-engine';

import './styles.scss';

export interface Properties {
  onOpenChange?: (isOpen: boolean) => void;
  onSelectReaction: (emoji) => void;
}

export interface State {
  isReactionTrayOpen: boolean;
  isEmojiPickerOpen: boolean;
}

const commonEmojiMapping = {
  thumbsup: '👍',
  heart: '❤️',
  joy: '😂',
  cry: '😢',
  astonished: '😲',
};

export class ReactionMenu extends React.Component<Properties, State> {
  ref = createRef<HTMLDivElement>();
  triggerRef = createRef<HTMLDivElement>();
  emojiPickerRef = createRef<HTMLDivElement>();

  state = {
    isReactionTrayOpen: false,
    isEmojiPickerOpen: false,
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.onClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onClickOutside);
  }

  onClickOutside = (event) => {
    if (
      !(
        (this.ref.current && this.ref.current.contains(event.target)) ||
        (this.triggerRef.current && this.triggerRef.current.contains(event.target)) ||
        (this.emojiPickerRef.current && this.emojiPickerRef.current.contains(event.target))
      )
    ) {
      this.setState({ isReactionTrayOpen: false, isEmojiPickerOpen: false });
      this.props.onOpenChange?.(false);
    }
  };

  onSelect = (emojiId) => {
    const emojiCharacter = commonEmojiMapping[emojiId];
    if (emojiCharacter) {
      this.props.onSelectReaction(emojiCharacter);
      this.toggleReactionTray();
    }
  };

  toggleReactionTray = () => {
    this.setState((prevState) => {
      const isReactionTrayOpen = !prevState.isReactionTrayOpen;
      this.props.onOpenChange?.(isReactionTrayOpen);
      return { isReactionTrayOpen, isEmojiPickerOpen: false };
    });
  };

  toggleEmojiPicker = () => {
    this.setState((prevState) => {
      const isEmojiPickerOpen = !prevState.isEmojiPickerOpen;
      if (isEmojiPickerOpen) {
        this.setState({ isReactionTrayOpen: false });
      }
      return { isEmojiPickerOpen };
    });
  };

  renderCommonReactions() {
    const commonReactions = [
      'thumbsup',
      'heart',
      'joy',
      'cry',
      'astonished',
    ];

    return commonReactions.map((emojiId) => (
      <span className='reaction-tray-item' key={emojiId} onClick={() => this.onSelect(emojiId)}>
        <Emoji emoji={emojiId} size={20} />
      </span>
    ));
  }

  renderReactionTray() {
    if (!this.triggerRef.current) {
      return null;
    }

    const triggerRect = this.triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const trayHeight = 56;
    const trayWidth = 256;

    const shouldRenderAbove = triggerRect.bottom + trayHeight > viewportHeight;

    const trayStyles = {
      top: shouldRenderAbove
        ? `${triggerRect.top + window.scrollY - trayHeight - 8}px`
        : `${triggerRect.bottom + window.scrollY + 8}px`,
      left: `${triggerRect.left + window.scrollX + triggerRect.width / 2 - trayWidth / 2}px`,
      transformOrigin: shouldRenderAbove ? 'bottom center' : 'top center',
      transform: 'translateY(0)',
    };

    return createPortal(
      <>
        <div className='reaction-menu__underlay' onClick={this.toggleReactionTray}></div>

        <div className='reaction-tray' style={trayStyles} ref={this.ref}>
          {this.renderCommonReactions()}

          <div className='reaction-tray-item'>
            <IconButton
              className='emoji-picker-trigger-icon'
              Icon={IconDotsHorizontal}
              size={20}
              onClick={this.toggleEmojiPicker}
            />
          </div>
        </div>
      </>,
      document.body
    );
  }

  renderEmojiPicker() {
    return createPortal(
      <div className='emoji-picker' ref={this.emojiPickerRef}>
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
    const { isReactionTrayOpen, isEmojiPickerOpen } = this.state;

    return (
      <div className='reaction-menu'>
        <div ref={this.triggerRef}>
          <IconButton
            className={'reaction-menu-trigger'}
            Icon={IconHeart}
            size={32}
            onClick={this.toggleReactionTray}
          />
        </div>

        {isReactionTrayOpen && this.renderReactionTray()}
        {isEmojiPickerOpen && this.renderEmojiPicker()}
      </div>
    );
  }
}
