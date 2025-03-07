import { SubmitManifestMessage, ZOSMessageType } from '../types/types';
import { setActiveZAppManifest } from '../../../store/active-zapp';
import { Dispatch } from 'redux';

/**
 * Store the current apps manifest and enable the features listed in the manifest
 *
 * @param event
 * @param dispatch Redux dispatch function
 */
export const submitManifestHandler = (dispatch: Dispatch) => (event: MessageEvent<SubmitManifestMessage>) => {
  dispatch(setActiveZAppManifest(event.data.manifest));

  if (event.source && event.source instanceof Window) {
    event.source.postMessage(
      {
        type: ZOSMessageType.ManifestReceived,
        status: 'success',
      },
      event.origin
    );
  }
};
