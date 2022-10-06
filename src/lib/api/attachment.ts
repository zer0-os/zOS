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
    .withCredentials()
    .catch((err) => console.error(err));

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
