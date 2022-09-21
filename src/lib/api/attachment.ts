import { config } from '../../config';
import * as Request from 'superagent';

interface AttachmentResponse {
  signedUrl: string;
  key: string;
}

export async function getAttachmentUrl(attachment: { key: string }): Promise<string> {
  const attachmentResponse = await Request.get<AttachmentResponse>(
    `${config.ZERO_API_URL}/api/feedItems/getAttachmentDownloadInfo`
  )
    .query({
      key: attachment.key,
    })
    .withCredentials();

  if (attachmentResponse.ok) {
    return attachmentResponse.body.signedUrl;
  }
}

export function download(key: string): void {
  // We can't just do `window.open` here, as chrome will think it's an untrusted popup and attemp to block it.
  const win = window.open('about:blank', '_blank');
  (async () => {
    const url = await getAttachmentUrl({ key });

    if (url) {
      win.location.assign(url);
    }
  })();
}
