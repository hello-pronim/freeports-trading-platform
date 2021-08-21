import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.vaultRequest || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectRequest = createSelector(
  [selectDomain],
  (vaultRequestState) => vaultRequestState.request
);

export const selectResponse = createSelector(
  [selectDomain],
  (vaultRequestState) => vaultRequestState.response
);

export const selectError = createSelector(
  [selectDomain],
  (vaultRequestState) => vaultRequestState.error
);

export const selectLoading = createSelector(
  [selectDomain],
  (vaultRequestState) => vaultRequestState.loading
);
