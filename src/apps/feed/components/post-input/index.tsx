import React, { RefObject } from 'react';
import Dropzone from 'react-dropzone';

import { config } from '../../../../config';
import { Key } from '../../../../lib/keyboard-search';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@zero-tech/zui/components/Button';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import ImageCards from '../../../../platform-apps/channels/image-cards';
import { PublicProperties as PublicPropertiesContainer } from './container';
import { ViewModes } from '../../../../shared-components/theme-engine';
import { IconFaceSmile } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import classNames from 'classnames';
import './styles.scss';

// should move these to a shared location
import { MediaType } from '../../../../store/messages';
import { Media, addImagePreview, dropzoneToMedia, windowClipboard } from '../../../../components/message-input/utils';
import { EmojiPicker } from '../../../../components/message-input/emoji-picker/emoji-picker';
import { MatrixAvatar } from '../../../../components/matrix-avatar';
import { POST_MAX_LENGTH } from '../../lib/constants';

const SHOW_MAX_LABEL_THRESHOLD = 0.8 * POST_MAX_LENGTH;

const cn = bemClassName('post-input-container');

export interface Properties extends PublicPropertiesContainer {
  avatarUrl?: string;
  isSubmitting?: boolean;
  viewMode: ViewModes;
  error?: string;
  clipboard?: {
    addPasteListener: (listener: EventListenerOrEventListenerObject) => void;
    removePasteListener: (listener: EventListenerOrEventListenerObject) => void;
  };

  dropzoneToMedia?: (files: any[]) => Media[];
}

interface State {
  value: string;
  media: Media[];
  isEmojisActive: boolean;
}

export class PostInput extends React.Component<Properties, State> {
  state = {
    value: this.props.initialValue || '',
    media: [],
    isEmojisActive: false,
  };

  private textareaRef: RefObject<HTMLTextAreaElement>;

  constructor(props) {
    super(props);

    this.textareaRef = React.createRef<HTMLTextAreaElement>();
  }

  componentDidMount() {
    if (this.props.onPostInputRendered) {
      this.props.onPostInputRendered(this.textareaRef);
    }

    this.clipboard.addPasteListener(this.clipboardEvent);
    this.adjustTextareaHeight();
  }

  get clipboard() {
    return this.props.clipboard || windowClipboard();
  }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.value !== this.state.value) {
      this.adjustTextareaHeight();
    }

    if (this.props.onPostInputRendered) {
      this.props.onPostInputRendered(this.textareaRef);
    }
  }

  componentWillUnmount() {
    this.clipboard.removePasteListener(this.clipboardEvent);
  }

  adjustTextareaHeight = () => {
    if (this.textareaRef.current) {
      const textarea = this.textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  get mimeTypes() {
    return {
      'image/*': [],
    };
  }

  get images() {
    return this.state.media.filter((m) => m.mediaType === MediaType.Image);
  }

  onSubmit = (): void => {
    const { value, media } = this.state;
    if (value || media.length) {
      this.props.onSubmit(value, media);
      this.setState({ value: '', media: [] });
    }
  };

  onKeyDown = (event): void => {
    if (!event.shiftKey && event.key === Key.Enter) {
      event.preventDefault();
      this.onSubmit();
    }
  };

  onChange = (event): void => {
    this.setState({ value: event.target.value });
  };

  removeMediaPreview = (mediaToRemove: { id: string }) => {
    const media = this.state.media;

    this.setState({
      media: media.filter((m) => m.id !== mediaToRemove.id),
    });

    this.props.onPostInputRendered(this.textareaRef);
  };

  mediaSelected = (newMedia: Media[]): void => {
    this.setState({ media: [...this.state.media, ...newMedia] });
    this.props.onPostInputRendered(this.textareaRef);
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

  openEmojis = () => this.setState({ isEmojisActive: true });
  closeEmojis = () => this.setState({ isEmojisActive: false });

  onInsertEmoji = (value: string) => {
    this.setState({ value });
    this.closeEmojis();
  };

  renderInput() {
    const isPostTooLong = this.state.value.length > POST_MAX_LENGTH;
    const isDisabled =
      (!this.state.value.trim() && !this.state.media.length) || this.props.isSubmitting || isPostTooLong;

    return (
      <div>
        <Dropzone
          onDrop={this.imagesSelected}
          noClick
          accept={this.mimeTypes}
          maxSize={config.cloudinary.max_file_size}
          disabled={true}
        >
          {({ getRootProps }) => (
            <div {...getRootProps({ ...cn('drop-zone-text-area') })}>
              <div {...cn('create-outer')}>
                <div>
                  <MatrixAvatar imageURL={this.props.avatarUrl} size={'regular'} />
                </div>
                <div {...cn('create-inner')}>
                  <div {...cn('input')}>
                    <AnimatePresence>
                      {this.props.isSubmitting && (
                        <motion.div
                          {...cn('loading')}
                          initial={{ width: 0, opacity: 1 }}
                          animate={{ width: '60%', opacity: 1 }}
                          exit={{ width: '100%', opacity: 0 }}
                          transition={{ duration: 0.4 }}
                        />
                      )}
                    </AnimatePresence>
                    <textarea
                      {...cn('input')}
                      onChange={this.onChange}
                      onKeyDown={this.onKeyDown}
                      placeholder={this.props.variant === 'comment' ? 'Write a Comment...' : 'Write a Post...'}
                      ref={this.textareaRef}
                      rows={2}
                      value={this.state.value}
                    />
                  </div>

                  <div {...cn('image')}>
                    <ImageCards images={this.images} onRemoveImage={this.removeMediaPreview} size='small' />
                  </div>

                  <div {...cn('actions')}>
                    <div {...cn('icon-wrapper')}>
                      <IconButton onClick={this.openEmojis} Icon={IconFaceSmile} size={26} />
                      <AnimatePresence>
                        {this.state.value.length > SHOW_MAX_LABEL_THRESHOLD && (
                          <motion.span
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 8, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            {...cn('characters')}
                            data-is-too-long={isPostTooLong ? '' : null}
                            data-testid='character-count'
                          >
                            {this.state.value.length} / {POST_MAX_LENGTH}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div {...cn('wrapper')}>
                      <p {...cn('error')}>{this.props.error}</p>
                      <Button
                        {...cn('button')}
                        isDisabled={isDisabled}
                        isLoading={this.props.isSubmitting}
                        onPress={this.onSubmit}
                      >
                        Create
                      </Button>
                    </div>
                  </div>

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
                </div>
              </div>
            </div>
          )}
        </Dropzone>
      </div>
    );
  }

  render() {
    return <div className={classNames(cn('').className, this.props.className)}>{this.renderInput()}</div>;
  }
}
