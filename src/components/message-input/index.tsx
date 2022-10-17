import React from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import classNames from 'classnames';
import { userMentionsConfig } from './mentions-config';
import { Key } from '../../lib/keyboard-search';
import { User } from '../../store/channels';

require('./styles.scss');

export interface Properties {
  className?: string;
  placeholder?: string;
  onSubmit: (message: string, mentionedUsers: string[]) => void;
  users: User[];
}

interface State {
  value: string;
  userIds: string[];
}

export class MessageInput extends React.Component<Properties, State> {
  state = { value: '', userIds: [] };
  onSubmit = (event) => {
    const {
      target: { value },
    } = event;
    const { userIds } = this.state;

    if (!event.shiftKey && event.key === Key.Enter && value) {
      event.preventDefault();
      this.props.onSubmit(value, userIds);
      this.setState({ value: '' });
    }
  };

  loadUsers = (search: string, callback): void => {
    const { users } = this.props;

    if (users.length) {
      const result = users
        .map((user) => ({
          display: [
            user.firstName,
            user.lastName,
          ].join(' '),
          id: user.id,
        }))
        .filter((user) => user.display.toLowerCase().includes(search.toLowerCase()));
      callback(result);
    }
  };

  contentChanged = (e, value): void => {
    const mentionIds = this.extractUserIds(value);
    this.setState({ value, userIds: mentionIds });
  };

  renderMentionTypes() {
    const mentions = [
      <Mention
        trigger='@'
        data={this.loadUsers}
        key='user'
        appendSpaceOnAdd
        markup={userMentionsConfig.markup}
        displayTransform={userMentionsConfig.displayTransform}
      />,
    ];

    return mentions;
  }

  renderInput() {
    return (
      <div className='message-input chat-message__new-message'>
        <div className='message-input__input-wrapper'>
          <div className={classNames('mentions-text-area', this.props.className)}>
            <MentionsInput
              className='mentions-text-area__wrap'
              placeholder={this.props.placeholder}
              onKeyDown={this.onSubmit}
              onChange={this.contentChanged}
              onBlur={this._handleBlur}
              value={this.state.value}
              suggestionsPortalHost={undefined}
            >
              {this.renderMentionTypes()}
            </MentionsInput>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return <div className={classNames('chat-message__input-wrapper', this.props.className)}>{this.renderInput()}</div>;
  }

  private extractUserIds = (content): string[] => {
    const search = userMentionsConfig.regexGlobal;
    const userIds: string[] = [];
    let result = search.exec(content);
    while (result !== null) {
      userIds.push(result[2]);
      result = search.exec(content);
    }

    return userIds;
  };

  private _handleBlur = (e, clickedSuggestion) => {
    if (clickedSuggestion) {
      return;
    }
  };
}
