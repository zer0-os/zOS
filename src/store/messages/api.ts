import { AttachmentResponse } from '../../lib/api/attachment';
import { get } from '../../lib/api/rest';
import { LinkPreview } from '../../lib/link-preview';
import { AttachmentUploadResult } from './index';

import axios from 'axios';

export async function uploadAttachment(file: File): Promise<AttachmentUploadResult> {
  const response = await get<any>('/api/feedItems/getAttachmentUploadInfo', undefined, {
    name: file.name,
    type: file.type,
  });
  const uploadInfo: AttachmentResponse = response.body;

  await axios.put(uploadInfo.signedUrl, file, {
    timeout: 2 * 60 * 1000,
    headers: {
      'Content-Type': file.type,
    },
    // note: for adding progress bar to the upload
    // https://github.com/m3m3n70/zero-web/blob/development/src/app/api/file/index.ts#L110
    onUploadProgress: (_event) => {},
  });

  return {
    name: file.name,
    key: uploadInfo.key,
    url: uploadInfo.key,
    type: 'file',
  };
}

export async function getLinkPreviews(link: string): Promise<LinkPreview> {
  const filter: any = { url: link };

  const response = await get<any>('/linkPreviews', filter);
  return response.body;
}
