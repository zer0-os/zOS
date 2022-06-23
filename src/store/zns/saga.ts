import { takeLatest, put, select } from 'redux-saga/effects';
import { SagaActionTypes, receive } from '.';
import getDeepProperty from 'lodash.get';

const deepestRouteSelector = (state) => {
  return getDeepProperty(state, 'zns.value.deepestVisitedRoute', '');
};

export function* setRoute(action) {
  const route = action.payload;
  let deepestVisitedRoute = yield select(deepestRouteSelector);

  if (route !== deepestVisitedRoute && !deepestVisitedRoute.includes(route)) {
    deepestVisitedRoute = route;
  }

  yield put(receive({ route, deepestVisitedRoute }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateRoute, setRoute);
}
