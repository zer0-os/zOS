import React from 'react';

import { UserForMention } from '../utils';
import { bemClassName } from '../../../lib/bem';
import { emojiMentionsConfig, userMentionsConfig } from '../mentions-config';

import { Mention, MentionsInput } from 'react-mentions';
import { Avatar } from '@zero-tech/zui/components';

const cn = bemClassName('message-input');

import '../styles.scss';

interface Properties {
  id: string;
  value: string;
  placeholder?: string;
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
            <div>
              <div {...cn('mentions-text-area-wrap__suggestions__item-name')}>{suggestion.display}</div>
              <div {...cn('mentions-text-area-wrap__suggestions__item-zid')}>{suggestion.displayHandle}</div>
            </div>
          </>
        )}
      />,
      <Mention
        trigger=':'
        data={[]}
        key='emoji'
        markup={emojiMentionsConfig.markup}
        regex={emojiMentionsConfig.regex}
        displayTransform={emojiMentionsConfig.displayTransform}
        style={{
          visibility: 'hidden',
        }}
      />,
    ];

    return mentions;
  }

  render() {
    return (
      <MentionsInput
        {...cn('mentions-text-area-wrap')}
        id={this.props.id}
        inputRef={this.props.textareaRef}
        placeholder={this.props.placeholder}
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
