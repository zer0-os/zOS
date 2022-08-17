import { get } from './rest';

interface SignedUrlResponse {
  signedUrl: string;
  key: string;
}

export async function getAttachmentUrl(attachment: { key: string }) {
  const downloadInfo = await get<SignedUrlResponse>('api/feedItems/getAttachmentDownloadInfo', null, {
    key: attachment.key,
  });

  return downloadInfo.signedUrl;
}

export function download(key: string) {
  // We can't just do `window.open` here, as chrome will think it's an untrusted popup and attemp to block it.
  const win = window.open('about:blank', '_blank');
  (async () => {
    const url = await getAttachmentUrl({ key });
    win.location.assign(url);
  })();
}
