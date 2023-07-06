import { put } from 'redux-saga/effects';
import { setLoadPage } from '.';
import { getHistory } from '../../lib/browser';
import { featureFlags } from '../../lib/feature-flags';
import { getCurrentUserWithChatAccessToken } from '../authentication/saga';
import { initializePublicLayout } from '../layout/saga';
import { config } from '../../config';

const anonymousPaths = [
  '/get-access',
  '/login',
];

export function* saga() {
  const history = getHistory();

  const success = yield getCurrentUserWithChatAccessToken();
  if (success) {
    // if you have a current user but they still hit login/sign-up,
    // we should redirect to index page in that case
    if (anonymousPaths.includes(history.location.pathname)) {
      history.replace({
        pathname: `/0.${config.defaultZnsRoute}/${config.defaultApp}`,
      });
    }
    return;
  }

  yield put(setLoadPage(true));

  if (anonymousPaths.includes(history.location.pathname)) {
    return;
  }

  if (featureFlags.allowPublicZOS) {
    yield initializePublicLayout();
    return;
  }

  history.replace({
    pathname: '/login',
  });
}
