import React, { RefObject, useState, useEffect, useRef } from 'react';
import Dropzone from 'react-dropzone';

import { config } from '../../../../config';
import { Key } from '../../../../lib/keyboard-search';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@zero-tech/zui/components/Button';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import { PublicProperties as PublicPropertiesContainer } from './container';
import { ViewModes } from '../../../../shared-components/theme-engine';
import { IconFaceSmile, IconLoading2, IconStickerCircle } from '@zero-tech/zui/icons';
import { PostMediaMenu } from './menu';

import { Container as QuoteContainer, Details as QuoteDetails } from '../post/quote';
import { Content } from '../post/content';

import { bemClassName } from '../../../../lib/bem';
import classNames from 'classnames';
import './styles.scss';

// should move these to a shared location
import { MediaType } from '../../../../store/messages';
import {
  Media,
  addImagePreview,
  formatFileSize,
  dropzoneToMedia,
  windowClipboard,
} from '../../../../components/message-input/utils';
import { EmojiPicker } from '../../../../components/message-input/emoji-picker/emoji-picker';
import { MatrixAvatar } from '../../../../components/matrix-avatar';
import { POST_MAX_LENGTH } from '../../lib/constants';
import { Giphy } from '../../../../components/message-input/giphy/giphy';
import { ToastNotification } from '@zero-tech/zui/components';
import { getPostMediaMaxFileSize, validateMediaFiles } from './utils';
import { useMediaUpload } from './useMediaUpload';
import ImageCard from '../../../../platform-apps/channels/image-cards/image-card';
import { QuotedPost } from '../feed/lib/types';
import { PostMedia } from '../post-media';
import { useSelector } from 'react-redux';
import { userZeroProSubscriptionSelector } from '../../../../store/authentication/selectors';

const SHOW_MAX_LABEL_THRESHOLD = 0.8 * POST_MAX_LENGTH;

const cn = bemClassName('post-input-container');

export interface Properties extends PublicPropertiesContainer {
  avatarUrl?: string;
  viewMode: ViewModes;
  clipboard?: {
    addPasteListener: (listener: EventListenerOrEventListenerObject) => void;
    removePasteListener: (listener: EventListenerOrEventListenerObject) => void;
  };

  dropzoneToMedia?: (files: any[]) => Media[];
  onPostInputRendered?: (textareaRef: RefObject<HTMLTextAreaElement>) => void;
  quotingPost?: QuotedPost;
}

export function PostInput(props: Properties) {
  const [value, setValue] = useState(props.initialValue || '');
  const [media, setMedia] = useState<Media | undefined>();
  const [isEmojisActive, setIsEmojisActive] = useState(false);
  const [isGiphyActive, setIsGiphyActive] = useState(false);
  const [isDropRejectedNotificationOpen, setIsDropRejectedNotificationOpen] = useState(false);
  const [rejectedType, setRejectedType] = useState<string | null>(null);

  const { uploadMedia, isPending: isUploadingMedia, removeUploadedMedia, uploadedMediaId } = useMediaUpload();
  const isZeroProSubscriber = useSelector(userZeroProSubscriptionSelector);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const clipboard = props.clipboard || windowClipboard();

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      });
    }
  };

  const mimeTypes = {
    'image/*': [],
    'video/*': [],
  };

  const onSubmit = (): void => {
    if (value || uploadedMediaId) {
      props.onSubmit(value, uploadedMediaId);
      setValue('');
      setMedia(undefined);
      removeUploadedMedia();
    }
  };

  const onKeyDown = (event): void => {
    if (!event.shiftKey && event.key === Key.Enter) {
      event.preventDefault();
      onSubmit();
    }
  };

  const onChange = (event): void => {
    setValue(event.target.value);
    adjustTextareaHeight();
  };

  const handleRemoveMediaPreview = () => {
    removeUploadedMedia();
    setMedia(undefined);
  };

  const mediaSelected = (newMedia: Media): void => {
    setMedia(newMedia);

    if (newMedia) {
      uploadMedia(newMedia.nativeFile);
    }
  };

  const imagesSelected = (acceptedFiles): void => {
    setIsDropRejectedNotificationOpen(false);
    setRejectedType(null);
    const { validFiles, rejectedFiles } = validateMediaFiles(acceptedFiles, isZeroProSubscriber);
    if (rejectedFiles.length > 0) {
      setRejectedType(rejectedFiles[0].file.type);
      setIsDropRejectedNotificationOpen(true);
    }
    const newImages: Media[] = props.dropzoneToMedia ? props.dropzoneToMedia(validFiles) : dropzoneToMedia(validFiles);
    if (newImages.length) {
      mediaSelected(newImages[0]);
    }
  };

  const clipboardEvent = async (event) => {
    if (document.activeElement !== textareaRef.current) {
      return;
    }

    const items = event.clipboardData.items;

    const newImages: any[] = Array.from(items)
      .filter((item: any) => item.kind === 'file' && (/image\/*/.test(item.type) || item.type === 'image/gif'))
      .map((file: any) => file.getAsFile())
      .filter(Boolean);

    if (newImages.length !== 0) {
      imagesSelected(await addImagePreview(newImages));
    }
  };

  const openEmojis = () => setIsEmojisActive(true);
  const closeEmojis = () => setIsEmojisActive(false);

  const onInsertEmoji = (newValue: string) => {
    setValue(newValue);
    closeEmojis();
  };

  const openGiphy = () => setIsGiphyActive(true);
  const closeGiphy = () => setIsGiphyActive(false);

  const onInsertGiphy = (giphy) => {
    mediaSelected({
      id: giphy.id.toString(),
      name: giphy.title,
      url: giphy.images.preview_gif.url,
      type: MediaType.Image,
      mediaType: MediaType.Image,
      giphy,
    });
    closeGiphy();
  };

  const onDropRejected = (rejectedFiles) => {
    const rejectedFile = rejectedFiles[0];
    if (rejectedFile?.errors[0]?.code === 'file-too-large') {
      setIsDropRejectedNotificationOpen(false);
      setRejectedType(null);
      setTimeout(() => {
        setRejectedType(rejectedFile.file.type);
        setIsDropRejectedNotificationOpen(true);
      }, 0);
    }
  };

  const renderToastNotification = () => {
    let maxSize = config.postMedia.imageMaxFileSize;
    if (rejectedType) {
      maxSize = getPostMediaMaxFileSize(rejectedType, isZeroProSubscriber);
    }
    const maxSizeFormatted = formatFileSize(maxSize);

    return (
      <ToastNotification
        viewportClassName='post-media-toast-notification'
        title=''
        description={`File exceeds ${maxSizeFormatted} size limit`}
        actionAltText=''
        positionVariant='left'
        openToast={isDropRejectedNotificationOpen}
      />
    );
  };

  useEffect(() => {
    if (props.onPostInputRendered) {
      props.onPostInputRendered(textareaRef);
    }

    clipboard.addPasteListener(clipboardEvent);
    adjustTextareaHeight();

    return () => {
      clipboard.removePasteListener(clipboardEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderInput = () => {
    const isPostTooLong = value.length > POST_MAX_LENGTH;
    const isDisabled = !value.trim() || isPostTooLong || isUploadingMedia;

    // Use 1GB for ZeroPro users, otherwise use the largest allowed size
    const maxSize = isZeroProSubscriber
      ? config.postMedia.zeroProUserMaxFileSize
      : Math.max(config.postMedia.imageMaxFileSize, config.postMedia.gifMaxFileSize, config.postMedia.videoMaxFileSize);

    return (
      <div>
        <Dropzone onDrop={imagesSelected} onDropRejected={onDropRejected} noClick accept={mimeTypes} maxSize={maxSize}>
          {({ getRootProps }) => (
            <div {...getRootProps({ ...cn('drop-zone-text-area') })}>
              <div {...cn('create-outer')}>
                <div>
                  <MatrixAvatar imageURL={props.avatarUrl} size={'regular'} />
                </div>
                <div {...cn('create-inner')}>
                  <div {...cn('input')}>
                    <textarea
                      {...cn('input')}
                      onChange={onChange}
                      onKeyDown={onKeyDown}
                      placeholder={props.variant === 'comment' ? 'Write a Comment...' : 'Write a Post...'}
                      ref={textareaRef}
                      rows={2}
                      value={value}
                    />
                  </div>

                  {props.quotingPost && (
                    <QuoteContainer {...cn('quote-container')}>
                      <QuoteDetails
                        avatarURL={props.quotingPost.userProfileView.profileImage}
                        name={props.quotingPost.userProfileView.firstName}
                        timestamp={new Date(props.quotingPost.createdAt).getTime()}
                      />
                      <Content text={props.quotingPost.text} isSinglePostView={false} />
                      {props.quotingPost.mediaId && <PostMedia mediaId={props.quotingPost.mediaId} />}
                    </QuoteContainer>
                  )}

                  <div {...cn('image')}>
                    {media && (
                      <div {...cn('image-container')} data-is-uploading={isUploadingMedia ? '' : null}>
                        {isUploadingMedia && (
                          <span>
                            <IconLoading2 size={16} />
                          </span>
                        )}
                        <ImageCard
                          showName={false}
                          {...cn('image-card')}
                          image={media}
                          size='small'
                          onRemoveImage={isUploadingMedia ? undefined : handleRemoveMediaPreview}
                        />
                      </div>
                    )}
                  </div>

                  <div {...cn('actions')}>
                    <div {...cn('icon-wrapper')}>
                      <PostMediaMenu
                        onSelected={(newMedia) => mediaSelected(newMedia[0])}
                        isZeroProSubscriber={isZeroProSubscriber}
                      />
                      <IconButton onClick={openGiphy} Icon={IconStickerCircle} size={26} />
                      <IconButton onClick={openEmojis} Icon={IconFaceSmile} size={26} />
                      <AnimatePresence>
                        {value.length > SHOW_MAX_LABEL_THRESHOLD && (
                          <motion.span
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 8, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            {...cn('characters')}
                            data-is-too-long={isPostTooLong ? '' : null}
                            data-testid='character-count'
                          >
                            {value.length} / {POST_MAX_LENGTH}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div {...cn('wrapper')}>
                      <Button {...cn('button')} isDisabled={isDisabled} onPress={onSubmit}>
                        Post
                      </Button>
                    </div>
                  </div>

                  {isGiphyActive && (
                    <div {...cn('giphy-picker-container')} onClick={closeGiphy}>
                      <div {...cn('giphy-picker-content')} onClick={(e) => e.stopPropagation()}>
                        <Giphy onClickGif={onInsertGiphy} onClose={closeGiphy} />
                      </div>
                    </div>
                  )}

                  <div {...cn('emoji-picker-container')}>
                    <EmojiPicker
                      textareaRef={textareaRef}
                      isOpen={isEmojisActive}
                      onOpen={openEmojis}
                      onClose={closeEmojis}
                      value={value}
                      viewMode={props.viewMode}
                      onSelect={onInsertEmoji}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Dropzone>
        {renderToastNotification()}
      </div>
    );
  };

  return <div className={classNames(cn('').className, props.className)}>{renderInput()}</div>;
}
