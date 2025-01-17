import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import {
  openUserProfile,
  closeUserProfile,
  openEditProfile,
  openSettings,
  onPrivateReadReceipts,
  onPublicReadReceipts,
  getUserReadReceiptPreference,
  openAccountManagement,
  openDownloads,
  openLinkedAccounts,
} from './saga';
import { UserProfileState, initialState as initialUserProfileState, Stage, setStage, setPublicReadReceipts } from '.';
import { rootReducer } from '../reducer';
import { User } from '../authentication/types';
import { getReadReceiptPreference, setReadReceiptPreference } from '../../lib/chat';
import { reset } from '../account-management/saga';

describe('openUserProfile', () => {
  it('should set stage to Overview', async () => {
    const { storeState } = await expectSaga(openUserProfile)
      .withReducer(rootReducer, initialState())
      .put(setStage(Stage.Overview))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.Overview);
  });
});

describe('openAccountManagement', () => {
  it('should reset state & set stage to openAccountManagement', async () => {
    const { storeState } = await expectSaga(openAccountManagement)
      .withReducer(rootReducer, initialState())
      .call(reset)
      .put(setStage(Stage.AccountManagement))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.AccountManagement);
  });
});

describe('openLinkedAccounts', () => {
  it('should set stage to LinkedAccounts', async () => {
    const { storeState } = await expectSaga(openLinkedAccounts)
      .withReducer(rootReducer, initialState())
      .put(setStage(Stage.LinkedAccounts))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.LinkedAccounts);
  });
});

describe('openEditProfile', () => {
  it('should set stage to EditProfile', async () => {
    const { storeState } = await expectSaga(openEditProfile)
      .withReducer(rootReducer, initialState())
      .put(setStage(Stage.EditProfile))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.EditProfile);
  });
});

describe('closeUserProfile', () => {
  it('should set stage to None', async () => {
    const initialStateWithOpenProfile = {
      ...initialState(),
      userProfile: {
        ...initialState().userProfile,
        stage: Stage.EditProfile,
      },
    };

    const { storeState } = await expectSaga(closeUserProfile)
      .withReducer(rootReducer, initialStateWithOpenProfile)
      .put(setStage(Stage.None))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.None);
  });
});

describe('openSettings', () => {
  it('should set stage to Settings', async () => {
    const { storeState } = await expectSaga(openSettings)
      .withReducer(rootReducer, initialState())
      .put(setStage(Stage.Settings))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.Settings);
  });
});

describe('openDownloads', () => {
  it('should set stage to Downloads', async () => {
    const { storeState } = await expectSaga(openDownloads)
      .withReducer(rootReducer, initialState())
      .put(setStage(Stage.Downloads))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.Downloads);
  });
});

describe('onPrivateReadReceipts', () => {
  it('should set read receipt preference to private and dispatch setPublicReadReceipts(false)', async () => {
    await expectSaga(onPrivateReadReceipts)
      .withReducer(rootReducer, initialState())
      .provide([
        [
          matchers.call.fn(setReadReceiptPreference),
          'private',
        ],
      ])
      .put(setPublicReadReceipts(false))
      .run();
  });
});

describe('onPublicReadReceipts', () => {
  it('should set read receipt preference to public and dispatch setPublicReadReceipts(true)', async () => {
    const initialStateWithPrivateReadReceipts = {
      ...initialState(),
      userProfile: {
        ...initialState().userProfile,
        isPublicReadReceipts: false,
      },
    };

    await expectSaga(onPublicReadReceipts)
      .withReducer(rootReducer, initialStateWithPrivateReadReceipts)
      .provide([
        [
          matchers.call.fn(setReadReceiptPreference),
          'public',
        ],
      ])
      .put(setPublicReadReceipts(true))
      .run();
  });
});

describe('getUserReadReceiptPreference', () => {
  it('should set isPublicReadReceipts to true when preference is public', async () => {
    const initialStateWithPrivateReadReceipts = {
      ...initialState(),
      userProfile: {
        ...initialState().userProfile,
        isPublicReadReceipts: false,
      },
    };

    const { storeState } = await expectSaga(getUserReadReceiptPreference)
      .withReducer(rootReducer, initialStateWithPrivateReadReceipts)
      .provide([
        [
          matchers.call.fn(getReadReceiptPreference),
          'public',
        ],
      ])
      .put(setPublicReadReceipts(true))
      .run();

    expect(storeState.userProfile.isPublicReadReceipts).toEqual(true);
  });

  it('should set isPublicReadReceipts to false when preference is private', async () => {
    const initialStateWithPublicReadReceipts = {
      ...initialState(),
      userProfile: {
        ...initialState().userProfile,
        isPublicReadReceipts: true,
      },
    };

    const { storeState } = await expectSaga(getUserReadReceiptPreference)
      .withReducer(rootReducer, initialStateWithPublicReadReceipts)
      .provide([
        [
          matchers.call.fn(getReadReceiptPreference),
          'private',
        ],
      ])
      .put(setPublicReadReceipts(false))
      .run();

    expect(storeState.userProfile.isPublicReadReceipts).toEqual(false);
  });
});

function initialState(userProfileAttrs: Partial<UserProfileState> = {}, data: Partial<User> = {}) {
  return {
    authentication: {
      user: {
        data: {
          ...data,
        },
      },
    },
    userProfile: {
      ...initialUserProfileState,
      ...userProfileAttrs,
    },
  } as any;
}
