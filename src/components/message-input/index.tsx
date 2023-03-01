import React, { RefObject } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import { emojiMentionsConfig, mentionsConfigs, userMentionsConfig } from './mentions-config';
import { Key } from '../../lib/keyboard-search';
import { User } from '../../store/channels';
import { UserForMention, Media, dropzoneToMedia, addImagePreview, windowClipboard } from './utils';
import Menu from './menu';
import ImageCards from '../../platform-apps/channels/image-cards';
import { config } from '../../config';
import { ParentMessage } from '../../lib/chat/types';
import ReplyCard from '../reply-card/reply-card';
import { IconFaceSmile } from '@zero-tech/zui/icons';
import { IconButton } from '../icon-button';
import { Picker } from 'emoji-mart';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { ViewModes } from '../../shared-components/theme-engine';
import { mapPlainTextIndex } from './react-mentions-utils';

import 'emoji-mart/css/emoji-mart.css';
import './styles.scss';

export interface PublicProperties {
  className?: string;
  placeholder?: string;
  id?: string;
  onSubmit: (message: string, mentionedUserIds: User['id'][], media: Media[]) => void;
  initialValue?: string;
  reply?: null | ParentMessage;
  onRemoveReply?: () => void;
  getUsersForMentions: (search: string) => Promise<UserForMention[]>;
  onMessageInputRendered?: (textareaRef: RefObject<HTMLTextAreaElement>) => void;
  renderAfterInput?: (value: string, mentionedUserIds: User['id'][]) => React.ReactNode;
  clipboard?: {
    addPasteListener: (listener: EventListenerOrEventListenerObject) => void;
    removePasteListener: (listener: EventListenerOrEventListenerObject) => void;
  };
}

export interface Properties extends PublicProperties {
  viewMode: ViewModes;
}

interface State {
  value: string;
  mentionedUserIds: string[];
  media: any[];
  isEmojisActive: boolean;
}

class MessageInputComponent extends React.Component<Properties, State> {
  state = { value: this.props.initialValue || '', mentionedUserIds: [], media: [], isEmojisActive: false };

  private textareaRef: RefObject<HTMLTextAreaElement>;

  constructor(props) {
    super(props);

    this.textareaRef = React.createRef<HTMLTextAreaElement>();
  }

  static mapState(state: RootState): Partial<Properties> {
    const {
      theme: {
        value: { viewMode },
      },
    } = state;

    return {
      viewMode,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  componentDidMount() {
    if (this.props.onMessageInputRendered) {
      this.props.onMessageInputRendered(this.textareaRef);
    }
    this.clipboard.addPasteListener(this.clipboardEvent);
  }

  get clipboard() {
    return this.props.clipboard || windowClipboard();
  }

  componentDidUpdate() {
    if (this.props.onMessageInputRendered) {
      this.props.onMessageInputRendered(this.textareaRef);
    }
  }

  componentWillUnmount() {
    this.clipboard.removePasteListener(this.clipboardEvent);
  }

  get mimeTypes() {
    return { 'image/*': [] };
  }

  get images() {
    return this.state.media.filter((m) => m.mediaType === 'image');
  }

  onSubmit = (event): void => {
    const { mentionedUserIds, value, media } = this.state;
    if (!event.shiftKey && event.key === Key.Enter && value) {
      event.preventDefault();

      this.props.onSubmit(value, mentionedUserIds, media);
      this.setState({ value: '', mentionedUserIds: [], media: [] });
    }
  };

  contentChanged = (event): void => {
    const {
      target: { value },
    } = event;

    const mentionedUserIds = this.extractUserIds(value);
    this.setState({ value, mentionedUserIds });
  };

  removeMediaPreview = (mediaToRemove: { id: string }) => {
    const media = this.state.media;

    this.setState({
      media: media.filter((m) => m.id !== mediaToRemove.id),
    });
    this.props.onMessageInputRendered(this.textareaRef);
  };

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

  removeReply = (): void => {
    this.props.onRemoveReply();
    this.props.onMessageInputRendered(this.textareaRef);
  };

  mediaSelected = (newMedia: Media[]): void => {
    this.setState({
      media: [
        ...this.state.media,
        ...newMedia,
      ],
    });
    this.props.onMessageInputRendered(this.textareaRef);
  };

  imagesSelected = (acceptedFiles): void => {
    const newImages: Media[] = dropzoneToMedia(acceptedFiles);

    if (newImages.length) {
      this.mediaSelected(newImages);
    }
  };

  clipboardEvent = async (event) => {
    const items = event.clipboardData.items;

    const newImages: any[] = Array.from(items)
      .filter((item: any) => item.kind === 'file' && /image\/*/.test(item.type))
      .map((file: any) => file.getAsFile())
      .filter(Boolean);

    if (newImages.length !== 0) {
      this.imagesSelected(await addImagePreview(newImages));
    }
  };

  openEmojis = () => {
    if (this.state.isEmojisActive) {
      return this.closeEmojis();
    }
    this.setState({ isEmojisActive: true });
    document.addEventListener('mousedown', this.clickOutsideEmojiCheck);
  };

  closeEmojis = () => {
    this.setState({ isEmojisActive: false });
    document.removeEventListener('mousedown', this.clickOutsideEmojiCheck);
  };

  clickOutsideEmojiCheck = (event: MouseEvent) => {
    const [emojiMart] = document.getElementsByClassName('emoji-mart');

    if (emojiMart && event && event.target) {
      if (!emojiMart.contains(event.target as Node)) {
        this.closeEmojis();
      }
    }
  };

  insertEmoji = async (emoji: any) => {
    const emojiToInsert = emoji.colons + ' ';

    const selectionStart = this.textareaRef && this.textareaRef.current.selectionStart;
    const position =
      selectionStart != null ? mapPlainTextIndex(this.state.value, mentionsConfigs, selectionStart, 'START') : null;
    this.setState((state) => {
      const value = state.value;
      const newValue =
        position == null
          ? value + emojiToInsert
          : [
              value.slice(0, position),
              emojiToInsert,
              value.slice(position),
            ].join('');
      return {
        value: newValue,
      };
    });

    this.closeEmojis();
  };

  renderInput() {
    return (
      <div className='message-input chat-message__new-message'>
        <div className='message-input__icons'>
          <Menu
            onSelected={this.mediaSelected}
            mimeTypes={this.mimeTypes}
            maxSize={config.cloudinary.max_file_size}
          />
        </div>

        <div className='message-input__input-wrapper'>
          <Dropzone
            onDrop={this.imagesSelected}
            noClick
            accept={this.mimeTypes}
            maxSize={config.cloudinary.max_file_size}
          >
            {({ getRootProps }) => (
              <div {...getRootProps({ className: 'mentions-text-area' })}>
                <ImageCards
                  images={this.images}
                  onRemoveImage={this.removeMediaPreview}
                  size='small'
                />
                {this.props.reply && (
                  <ReplyCard
                    message={this.props.reply.message}
                    onRemove={this.removeReply}
                  />
                )}
                {this.state.isEmojisActive && (
                  <div className='message-input__emoji-picker'>
                    <Picker
                      theme={this.props.viewMode}
                      emoji='mechanical_arm'
                      title='Zer0'
                      onSelect={this.insertEmoji}
                    />
                  </div>
                )}
                <MentionsInput
                  inputRef={this.textareaRef}
                  className='mentions-text-area__wrap'
                  id={this.props.id}
                  placeholder={this.props.placeholder}
                  onKeyDown={this.onSubmit}
                  onChange={this.contentChanged}
                  onBlur={this._handleBlur}
                  value={this.state.value}
                  allowSuggestionsAboveCursor
                  suggestionsPortalHost={document.body}
                >
                  {this.renderMentionTypes()}
                </MentionsInput>
                {this.props.renderAfterInput &&
                  this.props.renderAfterInput(this.state.value, this.state.mentionedUserIds)}
              </div>
            )}
          </Dropzone>
          <div className='message-input__icons-action'>
            <IconButton
              onClick={this.openEmojis}
              Icon={IconFaceSmile}
              size={16}
              className='image-send__icon'
            />
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

export const MessageInput = connectContainer<PublicProperties>(MessageInputComponent);
