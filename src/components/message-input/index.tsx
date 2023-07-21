import React, { RefObject } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import Dropzone from 'react-dropzone';

import { config } from '../../config';
import { Key } from '../../lib/keyboard-search';
import { MediaType } from '../../store/messages';
import { emojiMentionsConfig, userMentionsConfig } from './mentions-config';
import { UserForMention, Media, dropzoneToMedia, addImagePreview, windowClipboard } from './utils';

import Menu from './menu/menu';
import { IconButton } from '../icon-button';
import { EmojiPicker } from './emoji-picker/emoji-picker';
import ReplyCard from '../reply-card/reply-card';
import MessageAudioRecorder from '../message-audio-recorder';
import { Giphy, Properties as GiphyProperties } from './giphy/giphy';
import { ViewModes } from '../../shared-components/theme-engine';
import AudioCards from '../../platform-apps/channels/audio-cards';
import ImageCards from '../../platform-apps/channels/image-cards';
import AttachmentCards from '../../platform-apps/channels/attachment-cards';
import { PublicProperties as PublicPropertiesContainer } from './container';
import { IconFaceSmile, IconSend3, IconMicrophone2, IconStickerCircle } from '@zero-tech/zui/icons';
import { Avatar } from '@zero-tech/zui/components';

import classNames from 'classnames';
import './styles.scss';

export interface PublicProperties extends PublicPropertiesContainer {}

export interface Properties extends PublicPropertiesContainer {
  viewMode: ViewModes;
  isMessengerFullScreen?: boolean;
  placeholder?: string;
  clipboard?: {
    addPasteListener: (listener: EventListenerOrEventListenerObject) => void;
    removePasteListener: (listener: EventListenerOrEventListenerObject) => void;
  };
  dropzoneToMedia?: (files: any[]) => Media[];
}

interface State {
  value: string;
  mentionedUserIds: string[];
  media: Media[];
  attachments: Media[];
  isEmojisActive: boolean;
  isGiphyActive: boolean;
  isMicActive: boolean;
}

export class MessageInput extends React.Component<Properties, State> {
  state = {
    value: this.props.initialValue || '',
    mentionedUserIds: [],
    media: [],
    attachments: [],
    isMicActive: false,
    isEmojisActive: false,
    isGiphyActive: false,
  };

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
    return {
      'image/*': [],
      'text/*': [],
      'video/*': [],
      'application/pdf': [],
      'application/zip': [],
      'application/msword': [],
    };
  }

  get images() {
    return this.state.media.filter((m) => m.mediaType === MediaType.Image);
  }

  get audios() {
    return this.state.media.filter((m) => m.mediaType === MediaType.Audio);
  }

  get videos() {
    return this.state.media.filter((m) => m.mediaType === MediaType.Video);
  }

  get files() {
    return this.state.media.filter((m) => m.mediaType === MediaType.File);
  }

  focusInput() {
    if (this.textareaRef && this.textareaRef.current) {
      this.textareaRef.current.focus();
    }
  }

  onSend = (): void => {
    const { mentionedUserIds, value, media } = this.state;
    if (value || media.length) {
      this.props.onSubmit(value, mentionedUserIds, media);
      this.setState({ value: '', mentionedUserIds: [], media: [] });
    }
  };

  onKeyDown = (event): void => {
    if (!event.shiftKey && event.key === Key.Enter) {
      event.preventDefault();
      this.onSend();
    }
  };

  startMic = (): void => {
    if (this.state.isMicActive) {
      return this.cancelRecording();
    }
    this.setState({ isMicActive: true });
  };

  cancelRecording = (): void => {
    this.setState({ isMicActive: false });
    this.props.onMessageInputRendered(this.textareaRef);
  };

  createAudioClip = (recordedBlob: Media) => {
    if (!this.state.isMicActive) {
      return;
    }

    this.mediaSelected([recordedBlob]);
    this.setState({ isMicActive: false });
    this.props.onMessageInputRendered(this.textareaRef);
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
        renderSuggestion={(suggestion) => (
          <>
            <Avatar size={'small'} type={'circle'} imageURL={suggestion.profileImage} />
            <div className='message-input__mentions-text-area-wrap__suggestions__item-name'>{suggestion.display}</div>
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
    const newImages: Media[] = this.props.dropzoneToMedia
      ? this.props.dropzoneToMedia(acceptedFiles)
      : dropzoneToMedia(acceptedFiles);
    if (newImages.length) {
      this.mediaSelected(newImages);
    }
  };

  clipboardEvent = async (event) => {
    if (document.activeElement !== this.textareaRef.current) {
      return;
    }

    const items = event.clipboardData.items;

    const newImages: any[] = Array.from(items)
      .filter((item: any) => item.kind === 'file' && /image\/*/.test(item.type))
      .map((file: any) => file.getAsFile())
      .filter(Boolean);

    if (newImages.length !== 0) {
      this.imagesSelected(await addImagePreview(newImages));
    }
  };

  openGiphy = async () => {
    this.setState({
      isGiphyActive: true,
    });
  };

  closeGiphy = () => {
    this.setState({
      isGiphyActive: false,
    });
  };

  onInsertGiphy: GiphyProperties['onClickGif'] = (giphy) => {
    this.mediaSelected([
      {
        id: giphy.id.toString(),
        name: giphy.title,
        url: giphy.images.preview_gif.url,
        mediaType: MediaType.Image,
        giphy,
      },
    ]);
    this.props.onMessageInputRendered(this.textareaRef);
    this.closeGiphy();
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
    const hasInputValue = this.state.value?.length > 0;

    return (
      <div
        className={classNames('message-input__container', this.props.className, {
          'message-input__container--editing': this.props.isEditing,
        })}
      >
        {!this.props.isEditing && (
          <div className='message-input__icon-outer'>
            <div className='message-input__icon-wrapper'>
              <IconButton
                className={classNames('message-input__icon', 'message-input__icon--giphy')}
                onClick={this.openGiphy}
                Icon={IconStickerCircle}
                size={24}
              />
              <Menu
                onSelected={this.mediaSelected}
                mimeTypes={this.mimeTypes}
                maxSize={config.cloudinary.max_file_size}
              />
            </div>
          </div>
        )}

        <div className='message-input__chat-container'>
          <div className='message-input__scroll-container'>
            <div className='message-input__text-and-emoji-wrapper'>
              <Dropzone
                onDrop={this.imagesSelected}
                noClick
                accept={this.mimeTypes}
                maxSize={config.cloudinary.max_file_size}
              >
                {({ getRootProps }) => (
                  <div {...getRootProps({ className: 'message-input__mentions-text-area' })}>
                    <ImageCards images={this.images} onRemoveImage={this.removeMediaPreview} size='small' />
                    <AudioCards audios={this.audios} onRemove={this.removeMediaPreview} />
                    <AttachmentCards attachments={this.files} type='file' onRemove={this.removeMediaPreview} />
                    <AttachmentCards attachments={this.videos} type='video' onRemove={this.removeMediaPreview} />
                    {this.props.reply && <ReplyCard message={this.props.reply.message} onRemove={this.removeReply} />}

                    <div
                      className={classNames('message-input__emoji-picker-container', {
                        'message-input__emoji-picker-container--fullscreen': this.props.isMessengerFullScreen,
                      })}
                    >
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
                    {this.state.isGiphyActive && (
                      <Giphy
                        onClickGif={this.onInsertGiphy}
                        onClose={this.closeGiphy}
                        isMessengerFullScreen={this.props.isMessengerFullScreen}
                      />
                    )}
                    {this.state.isMicActive && (
                      <div>
                        <MessageAudioRecorder onClose={this.cancelRecording} onMediaSelected={this.createAudioClip} />
                      </div>
                    )}

                    <MentionsInput
                      inputRef={this.textareaRef}
                      className='message-input__mentions-text-area-wrap'
                      id={this.props.id}
                      placeholder={this.props.placeholder}
                      onKeyDown={this.onKeyDown}
                      onChange={this.contentChanged}
                      onBlur={this._handleBlur}
                      value={this.state.value}
                      allowSuggestionsAboveCursor
                      suggestionsPortalHost={document.body}
                    >
                      {this.renderMentionTypes()}
                    </MentionsInput>
                  </div>
                )}
              </Dropzone>

              <div className='message-input__emoji-icon-outer'>
                <div className='message-input__icon-wrapper'>
                  <IconButton
                    className={classNames('message-input__icon', ' message-input__icon--emoji')}
                    onClick={this.openEmojis}
                    Icon={IconFaceSmile}
                    size={24}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {!this.props.isEditing && (
          <div className='message-input__icon-outer'>
            <div className='message-input__icon-wrapper'>
              <IconButton
                className={classNames('message-input__icon', 'message-input__icon--end-action', {
                  'message-input__icon--send': hasInputValue,
                })}
                onClick={hasInputValue ? this.onSend : this.startMic}
                Icon={hasInputValue ? IconSend3 : IconMicrophone2}
                size={24}
              />
            </div>
          </div>
        )}

        {this.props.renderAfterInput && this.props.renderAfterInput(this.state.value, this.state.mentionedUserIds)}
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
    return (
      <div
        className={classNames('message-input', this.props.className, {
          'message-input--editing': this.props.isEditing,
        })}
      >
        {this.renderInput()}
      </div>
    );
  }
}
