import { expectSaga } from 'redux-saga-test-plan';

import { setActiveZAppManifest, clearActiveZAppManifest } from './saga';
import { setActiveZAppManifestAction, clearActiveZAppManifestAction } from './index';
import { ZAppManifest } from '../../apps/external-app/types/manifest';

describe('external-app saga', () => {
  const mockManifest: ZAppManifest = {
    title: 'ZApp',
    route: '/',
    url: 'https://zapp.zero.tech/',
    features: [],
  };

  describe('setActiveZAppManifest', () => {
    it('sets the manifest in the store', async () => {
      await expectSaga(setActiveZAppManifest, { payload: mockManifest })
        .put(setActiveZAppManifestAction(mockManifest))
        .run();
    });
  });

  describe('clearManifest', () => {
    it('clears the manifest from the store', async () => {
      await expectSaga(clearActiveZAppManifest).put(clearActiveZAppManifestAction()).run();
    });
  });
});
