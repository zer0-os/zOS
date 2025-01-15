import React, { RefObject } from 'react';
import Dropzone from 'react-dropzone';

import { config } from '../../config';
import { Key } from '../../lib/keyboard-search';
import { MediaType } from '../../store/messages';
import { userMentionsConfig } from './mentions/mentions-config';
import { Media, dropzoneToMedia, addImagePreview, windowClipboard } from './utils';

import Menu from './menu/menu';
import { EmojiPicker } from './emoji-picker/emoji-picker';
import ReplyCard from '../reply-card/reply-card';
import { Giphy, Properties as GiphyProperties } from './giphy/giphy';
import { ViewModes } from '../../shared-components/theme-engine';
import AudioCards from '../../platform-apps/channels/audio-cards';
import ImageCards from '../../platform-apps/channels/image-cards';
import AttachmentCards from '../../platform-apps/channels/attachment-cards';
import { PublicProperties as PublicPropertiesContainer } from './container';
import { IconFaceSmile, IconSend3, IconStickerCircle } from '@zero-tech/zui/icons';
import { IconButton, Tooltip } from '@zero-tech/zui/components';
import { textToPlainEmojis } from '../content-highlighter/text-to-emojis';
import { bemClassName } from '../../lib/bem';
import { Mentions } from './mentions';

import './styles.scss';

const cn = bemClassName('message-input');

export interface Properties extends PublicPropertiesContainer {
  replyIsCurrentUser: boolean;
  sendDisabledMessage?: string;
  viewMode: ViewModes;
  clipboard?: {
    addPasteListener: (listener: EventListenerOrEventListenerObject) => void;
    removePasteListener: (listener: EventListenerOrEventListenerObject) => void;
  };
  dropzoneToMedia?: (files: any[]) => Media[];
  onUserTyping: ({ roomId }: { roomId: string }) => void;
}

interface State {
  value: string;
  mentionedUserIds: string[];
  media: Media[];
  attachments: Media[];
  isEmojisActive: boolean;
  isGiphyActive: boolean;
  isSendTooltipOpen: boolean;
}

export class MessageInput extends React.Component<Properties, State> {
  state = {
    value: this.props.initialValue || '',
    mentionedUserIds: [],
    media: [],
    attachments: [],
    isEmojisActive: false,
    isGiphyActive: false,
    isSendTooltipOpen: false,
  };

  private textareaRef: RefObject<HTMLTextAreaElement>;

  constructor(props) {
    super(props);

    this.textareaRef = React.createRef<HTMLTextAreaElement>();
  }

  componentDidMount() {
    if (this.props.isEditing) {
      this.focusInput();
    }

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
    if (this.state.isSendTooltipOpen && this.isSendingEnabled) {
      this.setState({ isSendTooltipOpen: false });
    }
  }

  componentWillUnmount() {
    this.clipboard.removePasteListener(this.clipboardEvent);
  }

  // NOTE: commenting other types of media for now since we don't support them yet (in matrix)
  get mimeTypes() {
    return {
      'image/*': [],
      'video/*': [],
      'application/pdf': [],
      'audio/*': [],
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
      const input = this.textareaRef.current;

      // Set focus on the input
      input.focus();

      // Move the cursor to the end of the text
      const textLength = input.value.length;
      input.setSelectionRange(textLength, textLength);
    }
  }

  get isSendingDisabled() {
    return !this.isSendingEnabled;
  }

  get isSendingEnabled() {
    return !this.props.sendDisabledMessage?.trim();
  }

  onSend = (): void => {
    if (this.isSendingDisabled) {
      return this.setState({ isSendTooltipOpen: true });
    }

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

  contentChanged = (event): void => {
    let {
      target: { value },
    } = event;

    this.props.onUserTyping({ roomId: this.props.id });

    value = textToPlainEmojis(value);
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

  mediaSelected = (newMedia: Media[]): void => {
    this.setState({ media: [...this.state.media, ...newMedia] });
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

  openGiphy = () => this.setState({ isGiphyActive: true });
  closeGiphy = () => this.setState({ isGiphyActive: false });

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

  openEmojis = () => this.setState({ isEmojisActive: true });
  closeEmojis = () => this.setState({ isEmojisActive: false });

  onInsertEmoji = (value: string) => {
    this.setState({ value });
    this.closeEmojis();
    this.focusInput();
  };

  sendHighlighted = () => this.state.value?.length > 0 && this.isSendingEnabled;

  get sendDisabledTooltipContent() {
    return <div {...cn('disabled-tooltip')}>{this.props.sendDisabledMessage}</div>;
  }

  get allowGiphy() {
    return !this.props.isEditing;
  }

  get allowFileAttachment() {
    return !this.props.isEditing;
  }

  get allowLeftIcons() {
    return this.allowGiphy || this.allowFileAttachment;
  }

  get hasInputValue() {
    return this.state.value?.length > 0;
  }

  renderInput() {
    const reply = this.props.reply;

    return (
      <div {...cn('container')}>
        <div {...cn('addon-row')}>
          {reply && (
            <ReplyCard
              message={reply?.message}
              senderIsCurrentUser={this.props.replyIsCurrentUser}
              senderFirstName={reply?.sender?.firstName}
              senderLastName={reply?.sender?.lastName}
              mediaUrl={reply?.media?.url}
              mediaName={reply?.media?.name}
              onRemove={this.props.onRemoveReply}
              mediaType={reply?.media?.type}
            />
          )}
        </div>

        <div {...cn('input-row')}>
          {this.allowLeftIcons && (
            <div {...cn('icon-wrapper')}>
              {this.allowGiphy && (
                <IconButton {...cn('icon', 'giphy')} onClick={this.openGiphy} Icon={IconStickerCircle} size={26} />
              )}

              {this.allowFileAttachment && (
                <Menu
                  onSelected={this.mediaSelected}
                  mimeTypes={this.mimeTypes}
                  maxSize={config.cloudinary.max_file_size}
                />
              )}
            </div>
          )}

          <div {...cn('chat-container', this.props.isEditing && 'editing')}>
            <div {...cn('scroll-container')}>
              <div {...cn('text-and-emoji-wrapper')}>
                <Dropzone
                  onDrop={this.imagesSelected}
                  noClick
                  accept={this.mimeTypes}
                  maxSize={config.cloudinary.max_file_size}
                  disabled={!this.allowFileAttachment}
                >
                  {({ getRootProps }) => (
                    <div {...getRootProps({ ...cn('drop-zone-text-area') })}>
                      <ImageCards images={this.images} onRemoveImage={this.removeMediaPreview} size='small' />
                      <AudioCards audios={this.audios} onRemove={this.removeMediaPreview} />
                      <AttachmentCards attachments={this.files} type='file' onRemove={this.removeMediaPreview} />
                      <AttachmentCards attachments={this.videos} type='video' onRemove={this.removeMediaPreview} />

                      <div {...cn('emoji-picker-container')}>
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
                      {this.state.isGiphyActive && <Giphy onClickGif={this.onInsertGiphy} onClose={this.closeGiphy} />}

                      <Mentions
                        id={this.props.id}
                        value={this.state.value}
                        onBlur={this._handleBlur}
                        onChange={this.contentChanged}
                        onKeyDown={this.onKeyDown}
                        textareaRef={this.textareaRef}
                        getUsersForMentions={this.props.getUsersForMentions}
                      />
                    </div>
                  )}
                </Dropzone>

                <div {...cn('emoji-icon-outer')}>
                  <div {...cn('icon-wrapper')}>
                    {!this.props.isEditing && (
                      <IconButton {...cn('icon', 'emoji')} onClick={this.openEmojis} Icon={IconFaceSmile} size={26} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!this.props.isEditing && (
            <div {...cn('icon-wrapper')}>
              {/* See: ZOS-115
               * @ts-ignore */}
              <Tooltip content={this.sendDisabledTooltipContent} open={this.state.isSendTooltipOpen}>
                <IconButton
                  {...cn('icon', 'end-action')}
                  onClick={this.onSend}
                  Icon={IconSend3}
                  size={26}
                  isFilled={this.sendHighlighted()}
                  label='send'
                />
              </Tooltip>
            </div>
          )}
        </div>
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
    return <div {...cn('', this.props.isEditing && 'editing')}>{this.renderInput()}</div>;
  }
}
