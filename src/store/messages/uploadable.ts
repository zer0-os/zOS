import { CallEffect, call } from 'redux-saga/effects';

import { FileType, getFileType } from './utils';
import { Message } from '.';
import { uploadFileMessage, uploadImageUrl } from '../../lib/chat';

export const createUploadableFile = (file): Uploadable => {
  if (file.nativeFile && getFileType(file.nativeFile) === FileType.Media) {
    return new UploadableMedia(file);
  } else if (file.giphy) {
    return new UploadableGiphy(file);
  } else {
    return new UploadableAttachment(file);
  }
};

export interface Uploadable {
  file: any;
  optimisticMessage: Message;
  upload: (channelId, rootMessageId, isPost?) => Generator<CallEffect<Message | unknown>>;
}

export class UploadableMedia implements Uploadable {
  public optimisticMessage: Message;

  constructor(public file) {}
  *upload(channelId, rootMessageId, isPost = false) {
    return yield call(
      uploadFileMessage,
      channelId,
      this.file.nativeFile,
      rootMessageId,
      this.optimisticMessage?.id?.toString(),
      isPost
    );
  }
}

export class UploadableGiphy implements Uploadable {
  public optimisticMessage: Message;

  constructor(public file) {}
  *upload(channelId, rootMessageId) {
    const giphyData = this.file.giphy.images.downsized;

    return yield call(
      uploadImageUrl,
      channelId,
      giphyData.url,
      parseInt(giphyData.width),
      parseInt(giphyData.height),
      parseInt(giphyData.size),
      rootMessageId,
      this.optimisticMessage?.id?.toString()
    );
  }
}

export class UploadableAttachment implements Uploadable {
  public optimisticMessage: Message;

  constructor(public file) {}

  *upload(channelId, rootMessageId, isPost = false) {
    return yield call(
      uploadFileMessage,
      channelId,
      this.file.nativeFile,
      rootMessageId,
      this.optimisticMessage?.id?.toString(),
      isPost
    );
  }
}
