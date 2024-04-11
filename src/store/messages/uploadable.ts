import { CallEffect, call } from 'redux-saga/effects';

import { FileType, getFileType } from './utils';
import { Message } from '.';
import { chat } from '../../lib/chat';

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
  upload: (channelId, rootMessageId) => Generator<CallEffect<Message | unknown>>;
}

export class UploadableMedia implements Uploadable {
  public optimisticMessage: Message;

  constructor(public file) {}
  *upload(channelId, rootMessageId) {
    const chatClient = yield call(chat.get);

    return yield call(
      [
        chatClient,
        chatClient.uploadFileMessage,
      ],
      channelId,
      this.file.nativeFile,
      rootMessageId,
      this.optimisticMessage?.id?.toString()
    );
  }
}

export class UploadableGiphy implements Uploadable {
  public optimisticMessage: Message;
  constructor(public file) {}
  *upload(_channelId, _rootMessageId) {
    yield;
    throw new Error('Giphy upload is not supported yet.');
  }
}

export class UploadableAttachment implements Uploadable {
  public optimisticMessage: Message;
  constructor(public file) {}
  *upload(_channelId, _rootMessageId) {
    yield;
    throw new Error('Attachment upload is not supported yet.');
  }
}
