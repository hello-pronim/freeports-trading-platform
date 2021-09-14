import { createSelector } from "@reduxjs/toolkit";

import { initialState } from ".";
import { RootState } from "../../../../util/types/RootState";

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.orgSettings || initialState;

export const selectIsAccountsTrusting = createSelector(
  [selectDomain],
  (orgSettingsState) => orgSettingsState.accountsTrusting
);

export const selectIsTradeLevelsUpdating = createSelector(
  [selectDomain],
  (orgSettingsState) => orgSettingsState.tradeLevelsUpdating
);
