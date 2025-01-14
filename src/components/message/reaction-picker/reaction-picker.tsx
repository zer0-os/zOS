import React, { RefObject } from 'react';
import { Picker } from 'emoji-mart';
import { ViewModes } from '../../../shared-components/theme-engine';
import { bemClassName } from '../../../lib/bem';

import './styles.scss';

const cn = bemClassName('reaction-picker');

export interface Properties {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (value: string) => void;
}

export class ReactionPicker extends React.Component<Properties> {
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
    const emojiToInsert = emoji.native;
    this.props.onSelect(emojiToInsert);
  };

  render() {
    if (!this.props.isOpen) {
      return null;
    }

    return (
      <div {...cn('border-outer')}>
        <div {...cn('border-inner')} ref={this.pickerRef}>
          <Picker theme={ViewModes.Dark} emoji='mechanical_arm' title='ZOS' onSelect={this.insertEmoji} />
        </div>
      </div>
    );
  }
}
