import { get } from './rest';

interface AttachmentResponse {
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
    // This works, it's using the `https://res.cloudinary.url/..` to display the file
    // (eg. this is how it looks like: https://res.cloudinary.com/fact0ry-dev/image/upload/v1687385590/ax9wzrns7msfezo0ziqu.pdf)
    // but zero-web is uploading files to S3 first, and this api (getAttachmentUrl) was
    // created to get the file from S3, should we do that here as well?
    const url = key;

    //const url = await getAttachmentUrl({ key });
    if (url) {
      const win = window.open('about:blank', '_blank');
      win.location.assign(url);
    }
  })();
}
