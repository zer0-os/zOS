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
    .set(
      'Authorization',
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImpGTlhNbkZqR3JTb0RhZm5MUUJvaG9DTmFsV2NGY1RqbktFYmtSeldGQkh5WUpGaWtkTE1IUCJ9.eyJpYXQiOjE2NjMyNDI5NjMsImV4cCI6MTY2NTg3Mjc2MywiaXNzIjoiaHR0cHM6Ly96ZXJvLW5ldHdvcmstZGV2ZWxvcG1lbnQuaGVyb2t1YXBwLmNvbS8iLCJzdWIiOiJ6ZXJvfGZkMWZlNjI0LTg5NTUtNDQwYS04NzlmLWViNDA2ZGY1NDdmYyIsImF1ZCI6WyJodHRwczovL3plcm8tbmV0d29yay1kZXZlbG9wbWVudC5oZXJva3VhcHAuY29tLyJdLCJpZCI6ImZkMWZlNjI0LTg5NTUtNDQwYS04NzlmLWViNDA2ZGY1NDdmYyIsImh0dHA6Ly9mYWN0MHJ5LmNvbS9lbWFpbCI6ImJlbnJhZmlrLmtoYWxpZEBnbWFpbC5jb20iLCJodHRwOi8vZmFjdDByeS5jb20vYWNjb3VudC9yaXNrIjoidW5rbm93biIsImF6cCI6Imh0dHBzOi8vemVyby1uZXR3b3JrLWRldmVsb3BtZW50Lmhlcm9rdWFwcC5jb20vIn0.SE65e0XRIEQ5QaojrtWNCnofS9VXVNMiRoIedkyI86U'
    );

    
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
