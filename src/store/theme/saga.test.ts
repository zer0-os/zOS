import { expectSaga } from 'redux-saga-test-plan';

import { setViewMode } from './saga';

import { reducer } from '.';
import { ViewModes } from '../../shared-components/theme-engine';

describe('viewMode saga', () => {
  beforeAll(() => {
    global.localStorage = {
      setItem: jest.fn(),
    };
  });

  it('sets viewMode theme', async () => {
    const {
      storeState: { value },
    } = await expectSaga(setViewMode, { payload: ViewModes.Light }).withReducer(reducer).run();

    expect(value.viewMode).toEqual(ViewModes.Light);
  });

  it('call localStorage', async () => {
    expectSaga(setViewMode, { payload: ViewModes.Light }).withReducer(reducer).run();

    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
