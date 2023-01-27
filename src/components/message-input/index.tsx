import React, { RefObject } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import { userMentionsConfig } from './mentions-config';
import { Key } from '../../lib/keyboard-search';
import { User } from '../../store/channels';
import { UserForMention, getUsersForMentions, Media, dropzoneToMedia, addImagePreview, windowClipboard } from './utils';
import Menu from './menu';
import ImageCards from '../../platform-apps/channels/image-cards';
import { config } from '../../config';
import { ParentMessage } from '../../lib/chat/types';
import ReplyCard from '../reply-card/reply-card';

require('./styles.scss');

export interface Properties {
  className?: string;
  placeholder?: string;
  onSubmit: (message: string, mentionedUserIds: User['id'][], media: Media[]) => void;
  initialValue?: string;
  users: User[];
  reply?: null | ParentMessage;
  onRemoveReply?: () => void;
  getUsersForMentions: (search: string, users: User[]) => UserForMention[];
  onMessageInputRendered?: (textareaRef: RefObject<HTMLTextAreaElement>) => void;
  renderAfterInput?: (value: string, mentionedUserIds: User['id'][]) => React.ReactNode;
  clipboard?: {
    addPasteListener: (listener: EventListenerOrEventListenerObject) => void;
    removePasteListener: (listener: EventListenerOrEventListenerObject) => void;
  };
}

interface State {
  value: string;
  mentionedUserIds: string[];
  media: any[];
}

export class MessageInput extends React.Component<Properties, State> {
  static defaultProps = { getUsersForMentions };

  state = { value: this.props.initialValue || '', mentionedUserIds: [], media: [] };

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

  get mimeTypes() {
    return { 'image/*': [] };
  }

  renderInput() {
    return (
      <div className='message-input chat-message__new-message'>
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
                  border
                  onRemoveImage={this.removeMediaPreview}
                  size='small'
                />
                {this.props.reply && (
                  <ReplyCard
                    message={this.props.reply.message}
                    onRemove={this.removeReply}
                  />
                )}
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

                <div className='message-input__icons'>
                  <Menu
                    onSelected={this.mediaSelected}
                    mimeTypes={this.mimeTypes}
                    maxSize={config.cloudinary.max_file_size}
                  />
                </div>
                {this.props.renderAfterInput &&
                  this.props.renderAfterInput(this.state.value, this.state.mentionedUserIds)}
              </div>
            )}
          </Dropzone>
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
