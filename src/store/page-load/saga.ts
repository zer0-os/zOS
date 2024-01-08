import { call, put } from 'redux-saga/effects';
import { setIsComplete, setShowAndroidDownload } from '.';
import { getHistory, getNavigator } from '../../lib/browser';
import { getCurrentUserWithChatAccessToken } from '../authentication/saga';

const anonymousPaths = [
  '/get-access',
  '/login',
  '/reset-password',
];

export function* saga() {
  const history = yield call(getHistory);

  const success = yield call(getCurrentUserWithChatAccessToken);
  if (success) {
    yield handleAuthenticatedUser(history);
  } else {
    yield handleUnauthenticatedUser(history);
    yield call(setMobileAppDownloadVisibility, history);
  }

  yield put(setIsComplete(true));
}

function handleAuthenticatedUser(history) {
  // if you have a current user but they still hit login/sign-up,
  // we should redirect to index page in that case
  if (anonymousPaths.includes(history.location.pathname)) {
    history.replace({
      pathname: '/',
    });
  }
}

function* handleUnauthenticatedUser(history) {
  if (anonymousPaths.includes(history.location.pathname)) {
    return;
  }

  yield history.replace({ pathname: '/login' });
}

const MOBILE_APP_DOWNLOAD_PATHS = [
  '/get-access',
  '/login',
];

function* setMobileAppDownloadVisibility(history) {
  const isMobileAppDownloadPath = MOBILE_APP_DOWNLOAD_PATHS.includes(history.location.pathname);
  if (isMobileAppDownloadPath) {
    const navigator = yield call(getNavigator);
    if (navigator.userAgent.match(/Android/i)) {
      yield put(setShowAndroidDownload(isMobileAppDownloadPath));
    }
  }
}
