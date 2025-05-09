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
import { IconFaceSmile, IconStickerCircle } from '@zero-tech/zui/icons';
import { PostMediaMenu } from './menu';
import { featureFlags } from '../../../../lib/feature-flags';
import AttachmentCards from '../../../../platform-apps/channels/attachment-cards';

import { bemClassName } from '../../../../lib/bem';
import classNames from 'classnames';
import './styles.scss';

// should move these to a shared location
import { MediaType } from '../../../../store/messages';
import {
  Media,
  addImagePreview,
  bytesToMB,
  dropzoneToMedia,
  windowClipboard,
} from '../../../../components/message-input/utils';
import { EmojiPicker } from '../../../../components/message-input/emoji-picker/emoji-picker';
import { MatrixAvatar } from '../../../../components/matrix-avatar';
import { POST_MAX_LENGTH } from '../../lib/constants';
import { Giphy } from '../../../../components/message-input/giphy/giphy';
import { ToastNotification } from '@zero-tech/zui/components';
import { getPostMediaMaxFileSize, validateMediaFiles } from './utils';

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
  onPostInputRendered?: (textareaRef: RefObject<HTMLTextAreaElement>) => void;
}

interface State {
  value: string;
  media: Media[];
  isEmojisActive: boolean;
  isGiphyActive: boolean;
  isDropRejectedNotificationOpen: boolean;
  rejectedType: string | null;
}

export class PostInput extends React.Component<Properties, State> {
  state = {
    value: this.props.initialValue || '',
    media: [],
    isEmojisActive: false,
    isGiphyActive: false,
    isDropRejectedNotificationOpen: false,
    rejectedType: null,
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
      requestAnimationFrame(() => {
        const textarea = this.textareaRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      });
    }
  };

  get mimeTypes() {
    return {
      'image/*': [],
      'video/*': [],
    };
  }

  get images() {
    return this.state.media.filter((m) => m.mediaType === MediaType.Image);
  }

  get videos() {
    return this.state.media.filter((m) => m.mediaType === MediaType.Video);
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

    if (this.props.onPostInputRendered) {
      this.props.onPostInputRendered(this.textareaRef);
    }
  };

  mediaSelected = (newMedia: Media[]): void => {
    const mediaToAdd = newMedia[0] ? [newMedia[0]] : [];
    this.setState({ media: mediaToAdd });
    if (this.props.onPostInputRendered) {
      this.props.onPostInputRendered(this.textareaRef);
    }
  };

  imagesSelected = (acceptedFiles): void => {
    this.setState({ isDropRejectedNotificationOpen: false, rejectedType: null });
    const { validFiles, rejectedFiles } = validateMediaFiles(acceptedFiles);
    if (rejectedFiles.length > 0) {
      this.setState({ isDropRejectedNotificationOpen: false, rejectedType: null }, () => {
        this.setState({ isDropRejectedNotificationOpen: true, rejectedType: rejectedFiles[0].file.type });
      });
    }
    const newImages: Media[] = this.props.dropzoneToMedia
      ? this.props.dropzoneToMedia(validFiles)
      : dropzoneToMedia(validFiles);
    if (newImages.length) {
      this.mediaSelected([newImages[0]]);
    }
  };

  clipboardEvent = async (event) => {
    if (document.activeElement !== this.textareaRef.current) {
      return;
    }

    const items = event.clipboardData.items;

    const newImages: any[] = Array.from(items)
      .filter((item: any) => item.kind === 'file' && (/image\/*/.test(item.type) || item.type === 'image/gif'))
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

  openGiphy = () => this.setState({ isGiphyActive: true });
  closeGiphy = () => this.setState({ isGiphyActive: false });

  onInsertGiphy = (giphy) => {
    this.mediaSelected([
      {
        id: giphy.id.toString(),
        name: giphy.title,
        url: giphy.images.preview_gif.url,
        type: MediaType.Image,
        mediaType: MediaType.Image,
        giphy,
      },
    ]);
    this.closeGiphy();
  };

  onDropRejected = (rejectedFiles) => {
    const rejectedFile = rejectedFiles[0];
    if (rejectedFile?.errors[0]?.code === 'file-too-large') {
      // Reset first, then show again
      this.setState({ isDropRejectedNotificationOpen: false, rejectedType: null }, () => {
        this.setState({ isDropRejectedNotificationOpen: true, rejectedType: rejectedFile.file.type });
      });
    }
  };

  renderToastNotification = () => {
    let maxSize = config.postMedia.imageMaxFileSize;
    if (this.state.rejectedType) {
      maxSize = getPostMediaMaxFileSize(this.state.rejectedType);
    }
    const maxSizeMB = bytesToMB(maxSize);

    return (
      <ToastNotification
        viewportClassName='post-media-toast-notification'
        title=''
        description={`File exceeds ${maxSizeMB} size limit`}
        actionAltText=''
        positionVariant='left'
        openToast={this.state.isDropRejectedNotificationOpen}
      />
    );
  };

  renderInput() {
    const isPostTooLong = this.state.value.length > POST_MAX_LENGTH;
    const isDisabled =
      (!this.state.value.trim() && !this.state.media.length) || this.props.isSubmitting || isPostTooLong;

    // Set maxSize to the largest allowed, Dropzone will still reject based on this
    const maxSize = Math.max(
      config.postMedia.imageMaxFileSize,
      config.postMedia.gifMaxFileSize,
      config.postMedia.videoMaxFileSize
    );

    return (
      <div>
        <Dropzone
          onDrop={this.imagesSelected}
          onDropRejected={this.onDropRejected}
          noClick
          accept={this.mimeTypes}
          maxSize={maxSize}
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
                    <AttachmentCards attachments={this.videos} onRemove={this.removeMediaPreview} />
                  </div>

                  <div {...cn('actions')}>
                    <div {...cn('icon-wrapper')}>
                      <IconButton onClick={this.openEmojis} Icon={IconFaceSmile} size={26} />
                      {featureFlags.enablePostMedia && (
                        <>
                          <IconButton onClick={this.openGiphy} Icon={IconStickerCircle} size={26} />
                          <PostMediaMenu onSelected={this.mediaSelected} />
                        </>
                      )}
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

                  {this.state.isGiphyActive && (
                    <div {...cn('giphy-picker-container')} onClick={this.closeGiphy}>
                      <div {...cn('giphy-picker-content')} onClick={(e) => e.stopPropagation()}>
                        <Giphy onClickGif={this.onInsertGiphy} onClose={this.closeGiphy} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Dropzone>
        {this.renderToastNotification()}
      </div>
    );
  }

  render() {
    return <div className={classNames(cn('').className, this.props.className)}>{this.renderInput()}</div>;
  }
}
