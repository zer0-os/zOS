import React from 'react';

import { UserForMention } from '../utils';
import { bemClassName } from '../../../lib/bem';
import { highlightFilter } from '../../messenger/lib/utils';
import { userMentionsConfig } from './mentions-config';

import { Mention, MentionsInput } from 'react-mentions';
import { Avatar } from '@zero-tech/zui/components';

import './styles.scss';

const cn = bemClassName('mentions');

export interface Properties {
  id: string;
  value: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;

  onBlur: (event: any, clickedSuggestion: any) => void;
  onChange: (event: any) => void;
  onKeyDown: (event: any) => void;
  getUsersForMentions: (search: string) => Promise<UserForMention[]>;
}

export class Mentions extends React.Component<Properties> {
  searchMentionable = async (search: string, callback) => {
    const fetchedUsers = await this.props.getUsersForMentions(search);
    callback(fetchedUsers.sort(this.byIndexOf(search)));
  };

  byIndexOf(search: string): (a: UserForMention, b: UserForMention) => number {
    const getIndex = (user) => user.display.toLowerCase().indexOf(search.toLowerCase());
    return (a, b) => getIndex(a) - getIndex(b);
  }

  getCurrentMentionText() {
    const regex = /@([^)]+)$/;
    const matches = this.props.value.match(regex);
    return matches ? matches[1] : '';
  }

  highlightedText(text: string) {
    const currentMentionsText = this.getCurrentMentionText();
    return highlightFilter(text, currentMentionsText);
  }

  handleOnContextMenu(event: MouseEvent) {
    // Prevent the custom context menu from appearing, but still
    // allow the default browser context menu to appear
    event.stopPropagation();
  }

  renderMentionTypes() {
    const mentions = [
      <Mention
        trigger='@'
        data={this.searchMentionable}
        key='user'
        appendSpaceOnAdd
        markup={userMentionsConfig.markup}
        displayTransform={userMentionsConfig.displayTransform}
        renderSuggestion={(suggestion) => (
          <>
            <Avatar size={'small'} imageURL={suggestion.profileImage} />
            <div {...cn('suggestions-user-details')}>
              <div {...cn('suggestions-name')}>{this.highlightedText(suggestion.display)}</div>
              <div {...cn('suggestions-handle')}>{suggestion.displayHandle}</div>
            </div>
          </>
        )}
      />,
    ];

    return mentions;
  }

  render() {
    return (
      <MentionsInput
        {...cn('')}
        id={this.props.id}
        inputRef={this.props.textareaRef}
        onKeyDown={this.props.onKeyDown}
        onChange={this.props.onChange}
        onBlur={this.props.onBlur}
        value={this.props.value}
        allowSuggestionsAboveCursor
        suggestionsPortalHost={document.body}
        onContextMenu={this.handleOnContextMenu}
        placeholder='Write a Message...'
      >
        {this.renderMentionTypes()}
      </MentionsInput>
    );
  }
}
