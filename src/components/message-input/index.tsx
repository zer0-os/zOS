import React, { RefObject } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import classNames from 'classnames';
import { userMentionsConfig } from './mentions-config';
import { Key } from '../../lib/keyboard-search';
import { User } from '../../store/channels';
import { UserForMention, getUsersForMentions } from './utils';

require('./styles.scss');

export interface Properties {
  className?: string;
  placeholder?: string;
  onSubmit: (message: string, mentionedUserIds: User['id'][]) => void;
  users: User[];
  getUsersForMentions: (search: string, users: User[]) => UserForMention[];
  onMessageInputRendered: (textareaRef: RefObject<HTMLTextAreaElement>) => void;
}

interface State {
  value: string;
  mentionedUserIds: string[];
}

export class MessageInput extends React.Component<Properties, State> {
  static defaultProps = { getUsersForMentions };

  state = { value: '', mentionedUserIds: [] };

  private textareaRef: RefObject<HTMLTextAreaElement>;

  constructor(props) {
    super(props);

    this.textareaRef = React.createRef<HTMLTextAreaElement>();
  }

  componentDidMount() {
    this.props.onMessageInputRendered(this.textareaRef);
  }

  componentDidUpdate() {
    this.props.onMessageInputRendered(this.textareaRef);
  }

  onSubmit = (event) => {
    const { mentionedUserIds, value } = this.state;
    if (!event.shiftKey && event.key === Key.Enter && value) {
      event.preventDefault();
      this.props.onSubmit(value, mentionedUserIds);
      this.setState({ value: '', mentionedUserIds: [] });
    }
  };

  contentChanged = (event): void => {
    const {
      target: { value },
    } = event;

    const mentionedUserIds = this.extractUserIds(value);
    this.setState({ value, mentionedUserIds });
  };

  renderMentionTypes() {
    const mentions = [
      <Mention
        trigger='@'
        data={(search: string) => this.props.getUsersForMentions(search, this.props.users)}
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
              inputRef={this.textareaRef}
              className='mentions-text-area__wrap'
              placeholder={this.props.placeholder}
              onKeyDown={this.onSubmit}
              onChange={this.contentChanged}
              onBlur={this._handleBlur}
              value={this.state.value}
            >
              {this.renderMentionTypes()}
            </MentionsInput>
          </div>
        </div>
      </div>
    );
  }

  private extractUserIds = (content: string): string[] => {
    const search = userMentionsConfig.regexGlobal;
    const userIds: string[] = [];
    let result = search.exec(content);
    while (result !== null) {
      userIds.push(result[2]);
      result = search.exec(content);
    }

    return userIds;
  };

  private _handleBlur = (event, clickedSuggestion) => {
    if (clickedSuggestion) {
      return;
    }
  };

  render() {
    return <div className={classNames('chat-message__input-wrapper', this.props.className)}>{this.renderInput()}</div>;
  }
}
