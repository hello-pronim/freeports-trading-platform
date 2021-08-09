import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.global || initialState;

// eslint-disable-next-line import/prefer-default-export
export const selectUser = createSelector(
  [selectDomain],
  (globalState) => globalState.user
);

export const selectKeyList = createSelector(
  [selectDomain],
  (globalState) => globalState.keyList
);

export const selectRemoteKey = createSelector(
  [selectDomain],
  (globalState) => globalState.remoteKey
);
