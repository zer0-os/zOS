import { get } from './rest';

export interface AttachmentResponse {
  signedUrl: string;
  key: string;
}

export async function getAttachmentUrl(attachment: { key: string }): Promise<string> {
  const filter: any = { key: attachment.key };
  const attachmentResponse = await get<AttachmentResponse>(
    '/api/feedItems/getAttachmentDownloadInfo',
    undefined,
    filter
  ).catch((err) => console.error(err));

  if (attachmentResponse && attachmentResponse.ok) {
    return attachmentResponse.body.signedUrl;
  } else {
    return null;
  }
}

export function download(key: string): void {
  (async () => {
    const url = await getAttachmentUrl({ key });
    if (url) {
      const win = window.open('about:blank', '_blank');
      win.location.assign(url);
    }
  })();
}
