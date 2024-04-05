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

  highlightedText(text, filter) {
    const processedFilter = filter.slice(1);
    return highlightFilter(text, processedFilter);
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
            <Avatar size={'small'} type={'circle'} imageURL={suggestion.profileImage} />
            <div {...cn('suggestions-user-details')}>
              <div {...cn('suggestions-name')}>{this.highlightedText(suggestion.display, this.props.value)}</div>
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
      >
        {this.renderMentionTypes()}
      </MentionsInput>
    );
  }
}
