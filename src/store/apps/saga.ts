import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, receive } from '.';

export function* setRoute(action) {
  const route = action.payload;
  // let deepestVisitedRoute = yield select(deepestRouteSelector);
  //
  // if (( route !== deepestVisitedRoute ) && !deepestVisitedRoute.includes(route)) {
  //   deepestVisitedRoute = route;
  // }

  console.log('action', action);
  // yield put(receive({ route, 'dude' }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateRoute, setRoute);
}
    