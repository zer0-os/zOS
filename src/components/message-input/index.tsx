import React, { RefObject } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import { emojiMentionsConfig, userMentionsConfig } from './mentions-config';
import { Key } from '../../lib/keyboard-search';
import { UserForMention, Media, dropzoneToMedia, addImagePreview, windowClipboard } from './utils';
import Menu from './menu';
import ImageCards from '../../platform-apps/channels/image-cards';
import { config } from '../../config';
import ReplyCard from '../reply-card/reply-card';
import { IconFaceSmile } from '@zero-tech/zui/icons';
import { IconButton } from '../icon-button';
import { ViewModes } from '../../shared-components/theme-engine';
import { PublicProperties as PublicPropertiesContainer } from './container';
import { EmojiPicker } from './emoji-picker';

import './styles.scss';

export interface PublicProperties extends PublicPropertiesContainer {}

export interface Properties extends PublicPropertiesContainer {
  viewMode: ViewModes;
  placeholder?: string;
  clipboard?: {
    addPasteListener: (listener: EventListenerOrEventListenerObject) => void;
    removePasteListener: (listener: EventListenerOrEventListenerObject) => void;
  };
}

interface State {
  value: string;
  mentionedUserIds: string[];
  media: any[];
  isEmojisActive: boolean;
}

export class MessageInput extends React.Component<Properties, State> {
  state = { value: this.props.initialValue || '', mentionedUserIds: [], media: [], isEmojisActive: false };

  private textareaRef: RefObject<HTMLTextAreaElement>;

  constructor(props) {
    super(props);

    this.textareaRef = React.createRef<HTMLTextAreaElement>();
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

  focusInput() {
    if (this.textareaRef && this.textareaRef.current) {
      this.textareaRef.current.focus();
    }
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

  openEmojis = async () => {
    this.setState({
      isEmojisActive: true,
    });
  };

  closeEmojis = () => {
    this.setState({
      isEmojisActive: false,
    });
  };

  onInsertEmoji = (value: string) => {
    this.setState({
      value,
    });

    this.closeEmojis();
    this.focusInput();
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
                <div className='message-input__emoji-picker'>
                  <EmojiPicker
                    textareaRef={this.textareaRef}
                    isOpen={this.state.isEmojisActive}
                    onOpen={this.openEmojis}
                    onClose={this.closeEmojis}
                    value={this.state.value}
                    viewMode={this.props.viewMode}
                    onSelect={this.onInsertEmoji}
                  />
                </div>
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
              // className='image-send__icon's
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
