import { takeLatest, put, call, select } from 'redux-saga/effects';
import { SagaActionTypes, receive } from '.';
import getDeepProperty from 'lodash.get';

import { get as getResolver } from '../../lib/zns/domain-resolver';

const deepestRouteSelector = (state) => {
  return getDeepProperty(state, 'zns.value.deepestVisitedRoute', '');
};

export function* setRoute(action) {
  const route = action.payload;
  const domainResolver = yield call(getResolver);

  const rootDomainId = yield call(
    [
      domainResolver,
      domainResolver.idFromName,
    ],
    route.split('.')[0]
  );

  let deepestVisitedRoute = yield select(deepestRouteSelector);

  if (route !== deepestVisitedRoute && !deepestVisitedRoute.includes(route)) {
    deepestVisitedRoute = route;
  }

  yield put(
    receive({
      rootDomainId,
      route,
      deepestVisitedRoute,
    })
  );
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateRoute, setRoute);
}
