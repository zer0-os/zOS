import { CallEffect, call } from 'redux-saga/effects';

import { FileType, getFileType, getImageDimensions } from './utils';
import { Message } from '.';
import { uploadFileMessage, uploadImageUrl } from '../../lib/chat';

export const createUploadableFile = async (file): Promise<Uploadable> => {
  if (file.nativeFile && getFileType(file.nativeFile) === FileType.Media) {
    const dimensions = await getImageDimensions(file.nativeFile);
    console.log('XXXDIMENSIONS', dimensions);
    return new UploadableMedia(file, dimensions.width, dimensions.height);
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

  constructor(public file, private width: number, private height: number) {}
  *upload(channelId, rootMessageId) {
    console.log('xxxxdimensdwdwed', this.width, this.height);

    return yield call(
      uploadFileMessage,
      channelId,
      this.file.nativeFile,
      rootMessageId,
      this.optimisticMessage?.id?.toString(),
      this.width,
      this.height
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
  *upload(_channelId, _rootMessageId) {
    yield;
    throw new Error('Attachment upload is not supported yet.');
  }
}
