import React, { useRef, useState, useEffect, KeyboardEvent, ChangeEvent, useCallback, forwardRef } from 'react';
import Dropzone from 'react-dropzone';
import { config } from '../../config';
import { Key } from '../../lib/keyboard-search';
import { MediaType } from '../../store/messages';
import { userMentionsConfig } from './mentions/mentions-config';
import { Media, dropzoneToMedia, addImagePreview, windowClipboard, UserForMention, formatFileSize } from './utils';
import Menu from './menu/menu';
import { EmojiPicker } from './emoji-picker/emoji-picker';
import ReplyCard from '../reply-card/reply-card';
import { Giphy, Properties as GiphyProperties } from './giphy/giphy';
import AudioCards from '../../platform-apps/channels/audio-cards';
import ImageCards from '../../platform-apps/channels/image-cards';
import AttachmentCards from '../../platform-apps/channels/attachment-cards';
import { IconFaceSmile, IconSend3, IconStickerCircle } from '@zero-tech/zui/icons';
import { IconButton, Tooltip, ToastNotification } from '@zero-tech/zui/components';
import { textToPlainEmojis } from '../content-highlighter/text-to-emojis';
import { bemClassName } from '../../lib/bem';
import { Mentions } from './mentions';
import { ParentMessage } from '../../lib/chat/types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/reducer';
import { userZeroProSubscriptionSelector } from '../../store/authentication/selectors';
import './styles.scss';

const mimeTypes = {
  'image/*': [],
  'video/*': [],
  'application/pdf': [],
  'audio/*': [],
};

const selectViewMode = (state: RootState) => state.theme.value.viewMode;

const cn = bemClassName('message-input');

export interface Properties {
  id?: string;
  initialValue?: string;
  isEditing?: boolean;
  onSubmit: (message: string, mentionedUserIds: string[], media: Media[]) => void;
  getUsersForMentions: (search: string) => Promise<UserForMention[]>;
  renderAfterInput?: (value: string, mentionedUserIds: string[]) => React.ReactNode;
  onRemoveReply?: () => void;
  reply?: null | ParentMessage;
  replyIsCurrentUser?: boolean;
  sendDisabledMessage?: string;
  clipboard?: {
    addPasteListener: (listener: EventListenerOrEventListenerObject) => void;
    removePasteListener: (listener: EventListenerOrEventListenerObject) => void;
  };
  dropzoneToMedia?: (files: any[]) => Media[];
  onUserTyping?: ({ roomId }: { roomId: string }) => void;
}

export const MessageInput = forwardRef<HTMLTextAreaElement, Properties>((props, ref) => {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(props.initialValue || '');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [isEmojisActive, setIsEmojisActive] = useState(false);
  const [isGiphyActive, setIsGiphyActive] = useState(false);
  const [isSendTooltipOpen, setIsSendTooltipOpen] = useState(false);
  const [isDropzoneToastOpen, setIsDropzoneToastOpen] = useState(false);
  const viewMode = useSelector(selectViewMode);
  const isZeroProSubscriber = useSelector(userZeroProSubscriptionSelector);

  // 1GB for ZeroPro, 10MB for others
  const maxFileSize = isZeroProSubscriber ? config.messageFileSize.zeroProUser : config.messageFileSize.basicUser;

  const clipboard = props.clipboard || windowClipboard();
  const isSendingEnabled = !props.sendDisabledMessage?.trim();

  // Connect the forwarded ref to our local ref
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(localRef.current);
    } else if (ref) {
      ref.current = localRef.current;
    }
  }, [ref]);

  useEffect(() => {
    if (props.isEditing) {
      focusInput();
    }
  }, [props.isEditing]);

  useEffect(() => {
    if (isSendTooltipOpen && isSendingEnabled) {
      setIsSendTooltipOpen(false);
    }
  }, [isSendTooltipOpen, isSendingEnabled]);

  const focusInput = () => {
    if (localRef.current) {
      localRef.current.focus();
      const textLength = localRef.current.value.length;
      localRef.current.setSelectionRange(textLength, textLength);
    }
  };

  const onSend = (): void => {
    if (!isSendingEnabled) {
      return setIsSendTooltipOpen(true);
    }

    if (value || media.length) {
      props.onSubmit(value, mentionedUserIds, media);
      setValue('');
      setMentionedUserIds([]);
      setMedia([]);
    }
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!event.shiftKey && event.key === Key.Enter) {
      event.preventDefault();
      onSend();
    }
  };

  const contentChanged = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    let {
      target: { value: newValue },
    } = event;

    props.onUserTyping && props.onUserTyping({ roomId: props.id });

    newValue = textToPlainEmojis(newValue);
    const newMentionedUserIds = extractUserIds(newValue);
    setValue(newValue);
    setMentionedUserIds(newMentionedUserIds);
  };

  const removeMediaPreview = (mediaToRemove: { id: string }) => {
    setMedia(media.filter((m) => m.id !== mediaToRemove.id));
    focusInput();
  };

  const mediaSelected = useCallback(
    (newMedia: Media[]): void => {
      setMedia([...media, ...newMedia]);
      focusInput();
    },
    [media]
  );

  const imagesSelected = useCallback(
    (acceptedFiles): void => {
      const newImages: Media[] = props.dropzoneToMedia
        ? props.dropzoneToMedia(acceptedFiles)
        : dropzoneToMedia(acceptedFiles);
      if (newImages.length) {
        mediaSelected(newImages);
      }
    },
    [mediaSelected, props]
  );

  const onDropRejected = useCallback((rejectedFiles) => {
    const rejectedFile = rejectedFiles[0];
    if (rejectedFile?.errors[0]?.code === 'file-too-large') {
      // Reset first, then show again to ensure the toast can be triggered multiple times
      setIsDropzoneToastOpen(false);
      setTimeout(() => setIsDropzoneToastOpen(true), 0);
    }
  }, []);

  const renderDropzoneToast = () => {
    const maxSize = formatFileSize(maxFileSize);
    return (
      <ToastNotification
        viewportClassName='message-input-toast-notification'
        title=''
        description={`File exceeds ${maxSize} size limit`}
        actionAltText=''
        positionVariant='left'
        openToast={isDropzoneToastOpen}
      />
    );
  };

  const clipboardEvent = useCallback(
    async (event) => {
      if (document.activeElement !== localRef.current) {
        return;
      }

      const items = event.clipboardData.items;

      const newImages: any[] = Array.from(items)
        .filter((item: any) => item.kind === 'file' && /image\/*/.test(item.type))
        .map((file: any) => file.getAsFile())
        .filter(Boolean);

      if (newImages.length !== 0) {
        imagesSelected(await addImagePreview(newImages));
      }
    },
    [imagesSelected]
  );

  useEffect(() => {
    clipboard.addPasteListener(clipboardEvent);

    return () => {
      clipboard.removePasteListener(clipboardEvent);
    };
  }, [clipboard, clipboardEvent]);

  const openGiphy = () => setIsGiphyActive(true);
  const closeGiphy = () => setIsGiphyActive(false);

  const onInsertGiphy: GiphyProperties['onClickGif'] = (giphy) => {
    mediaSelected([
      {
        id: giphy.id.toString(),
        name: giphy.title,
        url: giphy.images.preview_gif.url,
        type: MediaType.Image,
        mediaType: MediaType.Image,
        giphy,
      },
    ]);
    focusInput();
    closeGiphy();
  };

  const openEmojis = () => setIsEmojisActive(true);
  const closeEmojis = () => setIsEmojisActive(false);

  const onInsertEmoji = (newValue: string) => {
    setValue(newValue);
    closeEmojis();
    focusInput();
  };

  const sendHighlighted = () => value?.length > 0 && isSendingEnabled;

  const sendDisabledTooltipContent = <div {...cn('disabled-tooltip')}>{props.sendDisabledMessage}</div>;

  const extractUserIds = (content: string): string[] => {
    const search = userMentionsConfig.regexGlobal;
    const userIds: string[] = [];
    let result = search.exec(content);
    while (result !== null) {
      userIds.push(result[2]);
      result = search.exec(content);
    }
    return userIds;
  };

  const handleBlur = (_event, clickedSuggestion) => {
    if (clickedSuggestion) {
      return;
    }
  };

  const allowGiphy = !props.isEditing;
  const allowFileAttachment = !props.isEditing;
  const allowLeftIcons = allowGiphy || allowFileAttachment;

  const images = media.filter((m) => m.mediaType === MediaType.Image);
  const audios = media.filter((m) => m.mediaType === MediaType.Audio);
  const videos = media.filter((m) => m.mediaType === MediaType.Video);
  const files = media.filter((m) => m.mediaType === MediaType.File);

  return (
    <div {...cn('', props.isEditing && 'editing')}>
      <div {...cn('container')}>
        <div {...cn('addon-row')}>
          {props.reply && (
            <ReplyCard
              message={props.reply?.message}
              senderIsCurrentUser={props.replyIsCurrentUser}
              senderFirstName={props.reply?.sender?.firstName}
              senderLastName={props.reply?.sender?.lastName}
              media={props.reply?.media}
              onRemove={props.onRemoveReply}
            />
          )}
        </div>

        <div {...cn('input-row')}>
          {allowLeftIcons && (
            <div {...cn('icon-wrapper')}>
              {allowGiphy && (
                <IconButton {...cn('icon', 'giphy')} onClick={openGiphy} Icon={IconStickerCircle} size={26} />
              )}

              {allowFileAttachment && <Menu onSelected={mediaSelected} mimeTypes={mimeTypes} maxSize={maxFileSize} />}
            </div>
          )}

          <div {...cn('chat-container', props.isEditing && 'editing')}>
            <div {...cn('scroll-container')}>
              <div {...cn('text-and-emoji-wrapper')}>
                <Dropzone
                  onDrop={imagesSelected}
                  onDropRejected={onDropRejected}
                  noClick
                  accept={mimeTypes}
                  maxSize={maxFileSize}
                  disabled={!allowFileAttachment}
                >
                  {({ getRootProps }) => (
                    <div {...getRootProps({ ...cn('drop-zone-text-area') })}>
                      <ImageCards images={images} onRemoveImage={removeMediaPreview} size='small' />
                      <AudioCards audios={audios} onRemove={removeMediaPreview} />
                      <AttachmentCards attachments={files} type='file' onRemove={removeMediaPreview} />
                      <AttachmentCards attachments={videos} type='video' onRemove={removeMediaPreview} />

                      <div {...cn('emoji-picker-container')}>
                        <EmojiPicker
                          textareaRef={localRef}
                          isOpen={isEmojisActive}
                          onOpen={openEmojis}
                          onClose={closeEmojis}
                          value={value}
                          viewMode={viewMode}
                          onSelect={onInsertEmoji}
                        />
                      </div>
                      {isGiphyActive && <Giphy onClickGif={onInsertGiphy} onClose={closeGiphy} />}

                      <Mentions
                        id={props.id}
                        value={value}
                        onBlur={handleBlur}
                        onChange={contentChanged}
                        onKeyDown={onKeyDown}
                        textareaRef={localRef}
                        getUsersForMentions={props.getUsersForMentions}
                      />
                    </div>
                  )}
                </Dropzone>

                <div {...cn('emoji-icon-outer')}>
                  <div {...cn('icon-wrapper')}>
                    {!props.isEditing && (
                      <IconButton {...cn('icon', 'emoji')} onClick={openEmojis} Icon={IconFaceSmile} size={26} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!props.isEditing && (
            <div {...cn('icon-wrapper')}>
              <Tooltip content={sendDisabledTooltipContent} open={isSendTooltipOpen}>
                <IconButton
                  {...cn('icon', 'end-action')}
                  onClick={onSend}
                  Icon={IconSend3}
                  size={26}
                  isFilled={sendHighlighted()}
                  label='send'
                />
              </Tooltip>
            </div>
          )}
        </div>
        {props.renderAfterInput && props.renderAfterInput(value, mentionedUserIds)}
      </div>
      {renderDropzoneToast()}
    </div>
  );
});
