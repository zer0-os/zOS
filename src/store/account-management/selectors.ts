import { RootState } from '../reducer';

export const isAddEmailAccountModalOpenSelector = (state: RootState) => {
  return state.accountManagement.isAddEmailAccountModalOpen;
};
