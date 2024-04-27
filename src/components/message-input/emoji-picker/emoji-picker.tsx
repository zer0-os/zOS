import React, { RefObject } from 'react';
import { mentionsConfigs } from '../mentions/mentions-config';
import { Picker } from 'emoji-mart';
import { ViewModes } from '../../../shared-components/theme-engine';
import { mapPlainTextIndex } from '../react-mentions-utils';

import './styles.scss';

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
  pickerRef: RefObject<HTMLDivElement> = React.createRef();

  componentDidMount() {
    document.addEventListener('mousedown', this.clickOutsideEmojiCheck);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.clickOutsideEmojiCheck);
  }

  clickOutsideEmojiCheck = (event: MouseEvent) => {
    if (!this.props.isOpen || !this.pickerRef.current) {
      return;
    }
    if (!this.pickerRef.current.contains(event.target as Node)) {
      this.props.onClose();
    }
  };

  insertEmoji = (emoji: any) => {
    const emojiToInsert = `${emoji.native || emoji.colons} `;
    const updatedValue = this.getUpdatedValue(emojiToInsert);
    this.props.onSelect(updatedValue);
  };

  getUpdatedValue = (emojiToInsert: string): string => {
    const selectionStart = this.props.textareaRef.current?.selectionStart;
    const position =
      selectionStart != null ? mapPlainTextIndex(this.props.value, mentionsConfigs, selectionStart, 'START') : null;
    return position == null
      ? this.props.value + emojiToInsert
      : this.props.value.slice(0, position) + emojiToInsert + this.props.value.slice(position);
  };

  get pickerViewMode() {
    return this.props.viewMode === ViewModes.Dark ? 'dark' : 'light';
  }

  render() {
    if (!this.props.isOpen) {
      return null;
    }

    return (
      <div ref={this.pickerRef} style={{ opacity: 0, animation: 'fadeIn 0.3s forwards' }}>
        <Picker theme={this.pickerViewMode} emoji='mechanical_arm' title='ZOS' onSelect={this.insertEmoji} />
      </div>
    );
  }
}
