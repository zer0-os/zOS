import { expectSaga } from 'redux-saga-test-plan';

import { setMainBackground } from './saga';

import { MainBackground, reducer } from '.';

describe('setMainBackground', () => {
  beforeAll(() => {
    global.localStorage = {
      setItem: jest.fn(),
      getItem: (_) => '',
      removeItem: () => {},
      length: 0,
      clear: () => {},
      key: (_) => '',
    };
  });

  it('call localStorage', async () => {
    expectSaga(setMainBackground, { payload: MainBackground.StaticGreenParticles }).withReducer(reducer).run();

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should handle dot-grid background', async () => {
    expectSaga(setMainBackground, { payload: MainBackground.DotGrid }).withReducer(reducer).run();
    expect(localStorage.setItem).toHaveBeenCalledWith('mainBackground:selectedMainBackground', MainBackground.DotGrid);
  });
});
