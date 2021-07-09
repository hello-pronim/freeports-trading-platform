import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.accountDetail || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectAccountDetail = createSelector(
  [selectDomain],
  (accountDetailState) => accountDetailState.selectedAccount
);

export const selectIsDetailLoading = createSelector(
  [selectDomain],
  (accountDetailState) => accountDetailState.loading
);

export const selectOperations = createSelector(
  [selectDomain],
  (accountDetailState) => accountDetailState.operations
);
