import { getHistory } from '../../lib/browser';
import { featureFlags } from '../../lib/feature-flags';
import { getCurrentUserWithChatAccessToken } from '../authentication/saga';
import { initializePublicLayout } from '../layout/saga';

const anonymousPaths = [
  '/get-access',
  '/login',
];

export function* saga() {
  const history = getHistory();
  if (anonymousPaths.includes(history.location.pathname)) {
    return;
  }

  const success = yield getCurrentUserWithChatAccessToken();
  if (success) {
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
