import React, { RefObject } from 'react';
import { mentionsConfigs } from '../mentions/mentions-config';
import { Picker } from 'emoji-mart';
import { ViewModes } from '../../../shared-components/theme-engine';
import { mapPlainTextIndex } from '../react-mentions-utils';

import 'emoji-mart/css/emoji-mart.css';

export interface Properties {
  textareaRef: RefObject<HTMLTextAreaElement>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  value: string;
  viewMode: ViewModes;
  onSelect: (value: string) => void;
}

export class EmojiPicker extends React.Component<Properties> {
  componentDidMount() {
    document.addEventListener('mousedown', this.clickOutsideEmojiCheck);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.clickOutsideEmojiCheck);
  }

  clickOutsideEmojiCheck = (event: MouseEvent) => {
    if (!this.props.isOpen) {
      return;
    }

    const [emojiMart] = document.getElementsByClassName('emoji-mart');

    if (emojiMart && event && event.target) {
      if (!emojiMart.contains(event.target as Node)) {
        this.props.onClose();
      }
    }
  };

  insertEmoji = (emoji: any) => {
    const emojiToInsert = (emoji.native || emoji.colons) + ' ';

    const selectionStart = this.props.textareaRef && this.props.textareaRef.current.selectionStart;
    const position =
      selectionStart != null ? mapPlainTextIndex(this.props.value, mentionsConfigs, selectionStart, 'START') : null;

    const value = this.props.value;
    const newValue =
      position == null
        ? value + emojiToInsert
        : [
            value.slice(0, position),
            emojiToInsert,
            value.slice(position),
          ].join('');

    this.props.onSelect(newValue);
  };

  get pickerViewMode() {
    if (this.props.viewMode === ViewModes.Dark) {
      return 'dark';
    } else {
      return 'light';
    }
  }

  render() {
    if (!this.props.isOpen) {
      return null;
    }

    return <Picker theme={this.pickerViewMode} emoji='mechanical_arm' title='ZOS' onSelect={this.insertEmoji} />;
  }
}
